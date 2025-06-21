import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVmDto } from './dtos/cicd.dto';
import * as AWS from 'aws-sdk';
import { NodeSSH } from 'node-ssh';
import axios from 'axios';
import { EncryptionService } from 'src/utils/encrypt.service';

@Injectable()
export class CicdService {
  private readonly logger = new Logger(CicdService.name);

  constructor(private prisma: PrismaService) {}

  private async createDnsRecord(
    instanceName: string,
    publicIp: string,
    cloudflareZoneId: string,
    cloudflareApiToken: string,
  ) {
    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records`,
        {
          comment: 'Domain verification record',
          name: instanceName,
          proxied: false,
          ttl: 86400,
          content: publicIp,
          type: 'A',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cloudflareApiToken}`,
          },
        },
      );
      return response.data.result.name;
    } catch (error) {
      this.logger.error(`Failed to create DNS record: ${error.message}`);
      throw error;
    }
  }

  async createVm(createVmDto: CreateVmDto) {
    const githubrepo = await this.prisma.github_repos.findFirst({
      where: { project_id: createVmDto.projectId },
    });
    const project = await this.prisma.projects.findFirst({
      where: { id: createVmDto.projectId },
    });
    const user = await this.prisma.users.findFirst({
      where: { id: project.owner_id },
    });
    const github_repo_url = githubrepo.github_repo_url;
    const encryptionService = new EncryptionService();
    const github_pat = encryptionService.decrypt(user.github_access_token);
    const og_access_key = process.env.OPENGIG_AWS_ACCESS_KEY_ID;
    const og_secret_key = process.env.OPENGIG_AWS_SECRET_ACCESS_KEY;
    const og_region = process.env.OPENGIG_AWS_REGION;
    const og_availability_zone = process.env.OPENGIG_AVAILABILITY_ZONE;
    const og_ssh_key = process.env.OPENGIG_AWS_SSH_KEY;
    const cloudflare_zone_id = process.env.OPENGIG_CLOUDFLARE_ZONE_ID;
    const cloudflare_api_token = process.env.OPENGIG_CLOUDFLARE_API_TOKEN;
    let aws_access_key: string;
    let aws_secret_key: string;
    let aws_region: string;
    let availability_zone: string;
    let aws_ssh_key: string;

    if (createVmDto.accountType === 'og') {
      aws_access_key = og_access_key;
      aws_secret_key = og_secret_key;
      aws_region = og_region;
      availability_zone = og_availability_zone;
      aws_ssh_key = og_ssh_key;
    } else {
      aws_access_key = createVmDto.awsAccessKey;
      aws_secret_key = createVmDto.awsSecretKey;
      aws_region = createVmDto.awsRegion;
      availability_zone = createVmDto.availabilityZone;
      aws_ssh_key = createVmDto.awsSshKey;
    }

    const projectId = createVmDto.projectId;

    const bundle_id = createVmDto.bundleId;
    // const cloudflare_zone_id = createVmDto.cloudflareZoneId;
    // const cloudflare_api_token = createVmDto.cloudflareApiToken;
    // const aws_ssh_key = createVmDto.awsSshKey;
    const blueprint_id = createVmDto.blueprintId;

    const cicd = await this.prisma.cicd.create({
      data: {
        project_id: projectId,
        aws_access_key: encryptionService.encrypt(aws_access_key),
        aws_secret_key: encryptionService.encrypt(aws_secret_key),
        aws_region: aws_region,
        availability_zone: availability_zone,
        bundle_id: bundle_id,
        github_pat: encryptionService.encrypt(github_pat),
        cloudflare_zone_id: encryptionService.encrypt(cloudflare_zone_id),
        cloudflare_api_token: encryptionService.encrypt(cloudflare_api_token),
        instance_name: '',
        github_repo_url: github_repo_url,
        blueprint_id: blueprint_id,
        public_ip: '',
        dns_name: '',
        aws_ssh_key: encryptionService.encrypt(aws_ssh_key),
        status: 'deploying',
        lastLogs: {},

        // Other fields will be updated once the instance is fully created
      },
    });

    // Configure AWS
    AWS.config.update({
      accessKeyId: aws_access_key,
      secretAccessKey: aws_secret_key,
      region: aws_region,
    });

    const lightsail = new AWS.Lightsail();
    const ssh = new NodeSSH();

    try {
      // Create a unique instance name
      const repoName = github_repo_url
        .split('/')
        .pop()
        .replace(/\.git$/, '');
      const owner = github_repo_url.split('/')[3];
      const instanceName = repoName;

      // Create Lightsail instance
      await lightsail
        .createInstances({
          instanceNames: [instanceName],
          availabilityZone: availability_zone,
          blueprintId: blueprint_id,
          bundleId: bundle_id,
        })
        .promise();

      let publicIpAddress;
      let attempts = 0;
      while (!publicIpAddress) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds between checks

        const instanceInfo = await lightsail
          .getInstance({
            instanceName: instanceName,
          })
          .promise();

        if (instanceInfo.instance.state.name === 'running') {
          publicIpAddress = instanceInfo.instance.publicIpAddress
            .split(':')[0]
            .trim();
          break;
        }

        // Add timeout protection
        attempts++;
        if (attempts > 24) {
          // 2 minutes maximum wait time
          throw new Error('Timeout waiting for instance to be ready');
        }
      }

      await lightsail
        .openInstancePublicPorts({
          instanceName: instanceName,
          portInfo: {
            fromPort: 0,
            toPort: 65535,
            protocol: 'ALL',
          },
        })
        .promise();
      console.log('opened ports');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log('Waiting for instance to initialize...');
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Connect via SSH with formatted key
      await ssh.connect({
        host: publicIpAddress,
        username: 'ubuntu',
        privateKey: aws_ssh_key,
        readyTimeout: 100000, // Optional: Increase timeout to 60 seconds
      });
      console.log('connected to ssh');

      // Execute commands

      //       const commands = [
      //         `export VM_INSTANCE_NAME=${instanceName} && \
      //          export INSTANCE_NAME="$VM_INSTANCE_NAME" && \
      //          echo "export INSTANCE_NAME='$VM_INSTANCE_NAME'" >> ~/.bashrc && \
      //          sudo hostnamectl set-hostname $VM_INSTANCE_NAME && \
      //          export REPO="$VM_INSTANCE_NAME" && \
      //          mkdir -p "$HOME/$REPO" `,
      //          `sudo apt update && sudo apt upgrade -y `,
      //          `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`,
      //          `curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg`,
      //         `curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list`,
      //         `sudo apt update`,
      //         `sudo apt install -y caddy apt-transport-https ca-certificates curl git build-essential git nodejs`,
      //         `sudo npm install -g pm2@latest`,
      //         `sudo install -m 0755 -d /etc/apt/keyrings`,
      //         `sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc`,
      //         `sudo chmod a+r /etc/apt/keyrings/docker.asc`,
      //         `echo \
      //   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      //   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      //   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
      //         `sudo apt-get update`,
      //         `sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`,
      //         `git clone "https://rbot:${createVmDto.githubPat}@github.com/${owner}/${repoName}.git" "$HOME/$REPO"`,
      //         `export CADDY_DOMAIN="${instanceName}.opengig.work" && \
      //          export CADDYFILE_PATH="/etc/caddy/Caddyfile" && \
      //          sudo rm $CADDYFILE_PATH && \
      //          touch $CADDYFILE_PATH && \
      //          sudo tee $CADDYFILE_PATH > /dev/null <<EOL && \
      //          sudo systemctl restart caddy`,
      //         `echo "Caddyfile created at $CADDYFILE_PATH with domain $CADDY_DOMAIN"`,
      //         `cd "$HOME/$REPO" && \
      //          docker compose up -d`
      //       ];

      const commands = [
        // Initial setup
        `export VM_INSTANCE_NAME=${instanceName} && \
         export REPO="$VM_INSTANCE_NAME" && \
         mkdir -p "$HOME/$REPO" && \
         sudo hostnamectl set-hostname $VM_INSTANCE_NAME && \
         git clone "https://x-access-token:${github_pat}@github.com/${owner}/${repoName}.git" "$HOME/$REPO" && \
         
         curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
         curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list && \
         sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && \
         sudo chmod a+r /etc/apt/keyrings/docker.asc && \
         echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
         sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
         sudo apt-get update && \
         sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin caddy && \
         sudo usermod -aG docker $USER && \ 
         sudo systemctl enable docker && \
         sudo systemctl restart docker && \
         
         sudo mkdir -p /etc/caddy && \
         sudo tee /etc/caddy/Caddyfile > /dev/null <<EOL
${instanceName}.opengig.work {
    reverse_proxy localhost:3000
}
EOL
         sudo systemctl restart caddy && \
         
         cd "$HOME/$REPO" && \
         sudo -E docker compose up -d`,
      ];
      let lastLogs = {};

      //   const commands = [`echo "hello"`]
      for (const command of commands) {
        const result = await ssh.execCommand(command);
        lastLogs = { time: new Date(), command: command, result: result };

        if (result.stderr) {
          this.logger.error(`Command error: ${result.stderr}`);
        }
      }

      ssh.dispose();

      // Create DNS record
      const dnsName = await this.createDnsRecord(
        instanceName,
        publicIpAddress,
        cloudflare_zone_id,
        cloudflare_api_token,
      );

      // Save CICD configuration to database

      await this.prisma.cicd.update({
        where: { id: cicd.id },
        data: {
          status: 'success',
          public_ip: publicIpAddress,
          instance_name: instanceName,
          dns_name: dnsName,
          lastLogs: lastLogs,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create VM: ${error.message}`);
      const cicdtoupdate = await this.prisma.cicd.findFirst({
        where: { project_id: projectId },
      });

      this.prisma.cicd.delete({
        where: { id: cicdtoupdate.id },
      });
    }
  }

  async deploy(projectId: string) {
    const cicd = await this.prisma.cicd.findFirst({
      where: { project_id: projectId },
    });
    await this.prisma.cicd.update({
      where: { id: cicd.id },
      data: { status: 'deploying' },
    });
    const encryptionService = new EncryptionService();

    if (!cicd) {
      throw new NotFoundException('CICD configuration not found');
    }
    let lastLogs = {};

    const ssh = new NodeSSH();

    try {
      const decKey = encryptionService.decrypt(cicd.aws_ssh_key);
      await ssh.connect({
        host: cicd.public_ip,
        username: 'ubuntu',
        privateKey: decKey,
      });

      const commands = [
        `cd "$HOME/${cicd.instance_name}" && \
         git pull && \
        sudo docker compose down && \
        sudo docker compose up -d --build`,
      ];

      for (const command of commands) {
        const result = await ssh.execCommand(command);
        lastLogs = { time: new Date(), command: command, result: result };
        if (result.stderr) {
          this.logger.error(`Command error: ${result.stderr}`);
        }
      }

      ssh.dispose();

      await this.prisma.cicd.update({
        where: { id: cicd.id },
        data: {
          status: 'success',
          last_deployed_at: new Date(),
          lastLogs: lastLogs,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to deploy: ${error.message}`);
      this.prisma.cicd.update({
        where: { id: cicd.id },
        data: { status: 'failed', lastLogs: lastLogs },
      });
      throw error;
    }
  }

  async getCicd(projectId: string) {
    const cicd = await this.prisma.cicd.findFirst({
      where: { project_id: projectId },
    });
    return cicd;
  }
}
