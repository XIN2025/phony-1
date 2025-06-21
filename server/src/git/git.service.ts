import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import axios, { isAxiosError } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { resolve } from 'path';
import { EncryptionService } from 'src/utils/encrypt.service';
@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);
  private git: SimpleGit;
  private readonly apiBaseUrl = 'https://api.github.com';
  private readonly githubToken = process.env.GITHUB_TOKEN;
  private readonly orgName = 'opengig-mvps';
  private readonly headers = {
    Authorization: `token ${this.githubToken}`,
    'Content-Type': 'application/json',
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {
    this.git = simpleGit();
  }

  async cloneRepository(
    repoUrl: string,
    destinationPath: string,
    branch?: string,
  ): Promise<void> {
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    try {
      const cloneOptions = branch ? { '--branch': branch } : {};
      await this.git.clone(repoUrl, destinationPath, cloneOptions);
      this.logger.log(`Repository cloned successfully to ${destinationPath}`);
    } catch (error) {
      this.logger.log(`Error cloning repository: ${error.message}`);
      throw error;
    }
  }

  async createRepo(projectId: string): Promise<string> {
    // check if github_repo_url is already present
    const gitRepo = await this.prismaService.github_repos.findFirst({
      where: { project_id: projectId },
    });

    if (gitRepo?.github_repo_url) {
      return gitRepo.github_repo_url;
    }

    const project = await this.prismaService.projects.findUnique({
      where: { id: projectId },
    });

    if (!project?.unique_name) {
      throw new HttpException(
        'Project not found or title is missing',
        HttpStatus.NOT_FOUND,
      );
    }

    const repoName = project.unique_name;
    const repoUrl = `${this.apiBaseUrl}/repos/${this.orgName}/${repoName}`;

    try {
      // Check if repository already exists
      const checkResponse = await axios.get(repoUrl, { headers: this.headers });
      return checkResponse.data.clone_url; // Repository exists, return its clone URL
    } catch (error) {
      if (error.response?.status === 404) {
        // Repository does not exist, create it
        try {
          const createResponse = await axios.post(
            `${this.apiBaseUrl}/orgs/${this.orgName}/repos`,
            {
              name: repoName,
              private: false, // Set to true to make repos private
            },
            { headers: this.headers },
          );
          return createResponse.data.clone_url;
        } catch (creationError) {
          this.logger.error(
            `Error creating repository: ${creationError.message}`,
          );
        }
      } else {
        // Some other error occurred while checking for the repository
        this.logger.error(`Error checking repository: ${error.message}`);
      }
    }
  }

  async pushCode(repoUrl: string, projectId: string, isError: boolean) {
    const rootPath = resolve(__dirname, '..', '..', '..');
    const localPath = resolve(rootPath, 'projects', projectId);

    console.log('repoUrl', repoUrl);

    try {
      // delete .git folder
      const gitFolder = resolve(localPath, '.git');
      if (fs.existsSync(gitFolder)) {
        fs.rmSync(gitFolder, { recursive: true });
      }
      const git = simpleGit(localPath);
      await git.init();
      const remotes = await git.getRemotes(true);
      const originExists = remotes.some((remote) => remote.name === 'origin');

      if (originExists) {
        await git.removeRemote('origin');
      }

      const sshRepoUrl = repoUrl.replace(
        /^https:\/\/github\.com\//,
        'git@github.com:',
      );

      await git.addRemote('origin', sshRepoUrl);
      await git.add('./*');
      await git.commit(`project completed`);
      await git.branch(['-M', 'master']);
      await git.push('origin', 'master', ['--force']);
      this.logger.log('Code pushed to repository:', repoUrl);

      // Save the repository URL to the database
      await this.prismaService.github_repos.create({
        data: {
          project_id: projectId,
          github_repo_url: repoUrl,
          isError: isError,
        },
      });
      await this.prismaService.deployments.create({
        data: {
          status: 'setup_pending',
          project_id: projectId,
        },
      });

      return repoUrl;
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Error pushing code:', error.message);
      throw new HttpException(
        'Error pushing code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pushCodeFromPathToRepo(localPath: string) {
    try {
      const git = simpleGit(localPath);
      await git.init();
      await git.fetch();

      const branchName = 'codespace';

      await git.add('./*');
      await git.commit(`Integration Completed`);
      await git.push('origin', branchName, ['--set-upstream']);
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Error pushing code:', error.message);
      throw new HttpException(
        'Error pushing code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkoutToCodespace(projectFolder: string) {
    const git = simpleGit(projectFolder);
    await git.fetch();
    const remoteBranches = await git.branch(['-r']);
    const branchExists = remoteBranches.all.includes('origin/codespace');
    if (branchExists) {
      await git.checkout('codespace');
    } else {
      await git.checkoutLocalBranch('codespace');
    }
  }

  async pushTemplateRepo(
    userId: string,
    projectFolder: string,
    githubUrl: string,
  ) {
    try {
      // delete .git folder
      const token = await this.getAccessToken(userId);
      const urlWithToken = githubUrl.replace(
        /^https:\/\/github\.com\//,
        `https://${token}@github.com/`,
      );
      const gitFolder = resolve(projectFolder, '.git');
      if (fs.existsSync(gitFolder)) {
        fs.rmSync(gitFolder, { recursive: true });
      }
      const git = simpleGit(projectFolder);
      await git.init();
      await git.addRemote('origin', urlWithToken);
      await git.add('./*');
      await git.commit(`project completed`);
      await git.branch(['-M', 'master']);
      await git.push('origin', 'master', ['--force']);
      this.logger.log('Code pushed to repository: ' + githubUrl);
      return githubUrl;
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Error pushing code:', error.message);
      throw new HttpException(
        'Error pushing code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCodeSpace(userId: string, projectId: string) {
    try {
      const token = await this.getAccessToken(userId);
      const github_repo = await this.prismaService.github_repos.findFirst({
        where: {
          project_id: projectId,
        },
      });
      if (!github_repo) {
        throw new HttpException('Repository not found', HttpStatus.NOT_FOUND);
      }
      if (github_repo.codespace_url) {
        return github_repo.codespace_url;
      }
      const owner = github_repo.github_repo_url.split('/')[3];
      const repoName = github_repo.github_repo_url.split('/')[4];
      const branch = github_repo.github_branch || 'master';

      const response = await axios.post(
        `${this.apiBaseUrl}/repos/${owner}/${repoName}/codespaces`,
        {
          ref: branch,
          machine: 'basicLinux32gb',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      const codespaceData = response.data;
      this.logger.log(`Code space created: ${codespaceData.name}`);

      await this.prismaService.github_repos.updateMany({
        where: { project_id: projectId },
        data: { codespace_url: `https://${codespaceData.name}.github.dev` },
      });

      return `https://${codespaceData.name}.github.dev`;
    } catch (error) {
      this.logger.error('Error creating code space:');
      this.logger.error(error);
      throw new HttpException(
        'Error creating codespace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchFileFromRepo(repoUrl: string, path: string, branch?: string) {
    try {
      const url = new URL(repoUrl);
      const repoPath = url.pathname;
      const apiUrl = `${this.apiBaseUrl}/repos${repoPath}/contents/${path}${
        branch ? `?ref=${branch}` : ''
      }`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${process.env.GITHUB_CLASSIC_TOKEN}`,
          Accept: 'application/vnd.github.v3.raw',
        },
      });

      if (response.data) {
        if (typeof response.data === 'object') {
          return JSON.stringify(response.data, null, 2);
        }
        return response.data;
      }
      throw new Error('File not found or empty');
    } catch (error) {
      this.logger.error(`Error fetching file from repo: ${error.message}`);
      throw new HttpException(
        'Error fetching file from repository',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async connectRepo(params: {
    githubBranch: string;
    githubRepo: string;
    githubOwner: string;
    projectId: string;
  }) {
    try {
      const project = await this.prismaService.projects.findUnique({
        where: { id: params.projectId },
      });
      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }
      const githubRepo = await this.prismaService.github_repos.findFirst({
        where: { project_id: params.projectId },
      });
      if (githubRepo) {
        throw new HttpException(
          'Repository already connected',
          HttpStatus.BAD_REQUEST,
        );
      }
      const repoUrl = `https://github.com/${params.githubOwner}/${params.githubRepo}`;
      const repo = await this.prismaService.github_repos.create({
        data: {
          project_id: params.projectId,
          github_repo_url: repoUrl,
          github_branch: params.githubBranch,
        },
      });
      return repo;
    } catch (error) {
      this.logger.error('Error connecting repository:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error connecting repository',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAccessToken(userId: string) {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    });
    if (!user?.github_access_token) {
      throw new HttpException('GitHub token not found', HttpStatus.NOT_FOUND);
    }
    return this.encryptionService.decrypt(user.github_access_token);
  }

  async getGithubStatus(userId: string) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
      if (!user?.github_access_token) {
        return null;
      }
      const token = this.encryptionService.decrypt(user.github_access_token);
      const response = await axios.get(`${this.apiBaseUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gitUser = {
        username: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
      };
      return gitUser;
    } catch (error) {
      return null;
    }
  }

  async getGithubOrgs(userId: string) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
      if (!user?.github_access_token) {
        throw new HttpException('GitHub token not found', HttpStatus.NOT_FOUND);
      }

      const token = this.encryptionService.decrypt(user.github_access_token);

      // Fetch user info
      const userResponse = await axios.get(`${this.apiBaseUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch orgs
      const orgsResponse = await axios.get(`${this.apiBaseUrl}/user/orgs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const owners = [
        {
          id: userResponse.data.id.toString(),
          login: userResponse.data.login,
          type: 'User',
          avatarUrl: userResponse.data.avatar_url,
        },
        ...orgsResponse.data.map((org) => ({
          id: org.id.toString(),
          login: org.login,
          type: 'Organization',
          avatarUrl: org.avatar_url,
        })),
      ];

      return owners;
    } catch (error) {
      this.logger.error('Error fetching GitHub orgs:', error);
      return [];
    }
  }

  async getGithubRepos(
    userId: string,
    owner: string,
    ownerType: string,
    page = 1,
    perPage = 30,
  ) {
    try {
      const token = await this.getAccessToken(userId);
      let url = '';
      if (ownerType === 'User') {
        url = `${this.apiBaseUrl}/user/repos?page=${page}&per_page=${perPage}`;
      } else {
        url = `${this.apiBaseUrl}/orgs/${owner}/repos?page=${page}&per_page=${perPage}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let nextPage: number | null = null;
      const linkHeader = response.headers.link;

      if (linkHeader) {
        const nextLink = linkHeader
          .split(',')
          .find((link) => link.includes('rel="next"'));
        if (nextLink) {
          const pageMatch = nextLink.match(/[?&]page=(\d+)/);
          nextPage = pageMatch ? parseInt(pageMatch[1]) : null;
        }
      }

      const formattedData = response.data.map((repo) => ({
        id: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        updatedAt: repo.updated_at,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        owner: repo.owner.login,
      }));

      return {
        data: formattedData,
        nextPage,
      };
    } catch (error) {
      this.logger.error('Error fetching GitHub repos:', error);
      throw new HttpException(
        'Failed to fetch GitHub repositories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGithubBranches(userId: string, owner: string, repo: string) {
    try {
      const token = await this.getAccessToken(userId);

      const response = await axios.get(
        `${this.apiBaseUrl}/repos/${owner}/${repo}/branches`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const defaultBranch = await this.getDefaultBranch(userId, owner, repo);
      let nextPage: number | null = null;
      const linkHeader = response.headers.link;

      if (linkHeader) {
        const nextLink = linkHeader
          .split(',')
          .find((link) => link.includes('rel="next"'));
        if (nextLink) {
          const pageMatch = nextLink.match(/[?&]page=(\d+)/);
          nextPage = pageMatch ? parseInt(pageMatch[1]) : null;
        }
      }
      return {
        data: response.data.map((branch) => ({
          name: branch.name,
          isDefault: branch.name === defaultBranch,
        })),
        nextPage,
      };
    } catch (error) {
      this.logger.error('Error fetching GitHub branches:', error);
      throw new HttpException(
        'Failed to fetch GitHub branches',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDefaultBranch(userId: string, owner: string, repo: string) {
    try {
      const token = await this.getAccessToken(userId);
      const response = await axios.get(
        `${this.apiBaseUrl}/repos/${owner}/${repo}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.default_branch;
    } catch (error) {
      this.logger.error('Error fetching default branch:', error);
      throw new HttpException(
        'Failed to fetch default branch',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkGithubRepositoryAvailability(
    userId: string,
    owner: string,
    repo: string,
  ) {
    try {
      const token = await this.getAccessToken(userId);
      await axios.get(`${this.apiBaseUrl}/repos/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return false;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return true;
        }
      }
      return false;
    }
  }

  async createPullRequest(
    userId: string,
    params: {
      repositoryUrl: string;
      title: string;
      body?: string;
      head: string;
      base: string;
    },
  ): Promise<any> {
    try {
      const token = await this.getAccessToken(userId);

      // Extract owner and repo from repository URL
      const [owner, repo] = params.repositoryUrl
        .replace('https://github.com/', '')
        .replace('.git', '')
        .split('/');

      const response = await axios.post(
        `${this.apiBaseUrl}/repos/${owner}/${repo}/pulls`,
        {
          title: params.title,
          body: params.body || '',
          head: params.head,
          base: params.base,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      this.logger.log(
        `Pull request created successfully: ${response.data.html_url}`,
      );
      return response.data.html_url;
    } catch (error) {
      this.logger.error(`Failed to create pull request: ${error.message}`);
      throw new HttpException(
        `Failed to create pull request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cloneRepositoryWithUserToken(
    userId: string,
    params: {
      repositoryUrl: string;
      destinationPath: string;
      branch?: string;
    },
  ): Promise<void> {
    try {
      // Get and decrypt user's GitHub token
      const token = await this.getAccessToken(userId);

      // Create destination directory if it doesn't exist
      if (!fs.existsSync(params.destinationPath)) {
        fs.mkdirSync(params.destinationPath, { recursive: true });
      }

      // Format repository URL with token
      const repoUrlWithAuth = params.repositoryUrl.replace(
        'https://',
        `https://${token}@`,
      );

      // Clone with options
      const cloneOptions = params.branch ? { '--branch': params.branch } : {};
      await this.git.clone(
        repoUrlWithAuth,
        params.destinationPath,
        cloneOptions,
      );

      this.logger.log(
        `Repository cloned successfully to ${params.destinationPath}`,
      );
    } catch (error) {
      this.logger.error(`Error cloning repository: ${error.message}`);
      throw new HttpException(
        'Failed to clone repository',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUserRepo(
    userId: string,
    projectId: string,
    params: {
      owner: string;
      repoName: string;
      ownerType: string;
      visibility: string;
    },
  ) {
    try {
      const { owner, repoName, ownerType, visibility } = params;
      console.log(params);
      const token = await this.getAccessToken(userId);
      let repoUrl = '';
      if (ownerType === 'User') {
        repoUrl = `${this.apiBaseUrl}/user/repos`;
      } else {
        repoUrl = `${this.apiBaseUrl}/orgs/${owner}/repos`;
      }
      const response = await axios.post(
        repoUrl,
        { name: repoName, private: visibility === 'private' },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.clone_url;
    } catch (error) {
      this.logger.error('Error creating user repository: ');
      throw new HttpException(
        'Failed to create user repository',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGithubRepoByProjectId(projectId: string) {
    const githubRepo = await this.prismaService.github_repos.findFirst({
      where: { project_id: projectId },
    });
    return githubRepo;
  }
}
