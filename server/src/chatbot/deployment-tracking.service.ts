import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeploymentStage, StageStatus } from '@prisma/client';

@Injectable()
export class DeploymentTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async createDeployment(
    projectId: string,
    deployedBy: string,
    deployedByEmail: string,
  ) {
    return await this.prisma.deployments.create({
      data: {
        project_id: projectId,
        deployed_by: deployedBy,
        deployed_by_email: deployedByEmail,
        status: 'initializing',
      },
    });
  }

  async createDeploymentStage(
    deploymentId: string,
    stage: DeploymentStage,
    status: StageStatus,
    deployedBy: string,
    deployedByEmail: string,
    toolName?: string,
    logs?: string,
    metadata?: any,
    errorMessage?: string,
  ) {
    return await this.prisma.deployment_stages.create({
      data: {
        deployment_id: deploymentId,
        stage,
        status,
        deployed_by: deployedBy,
        deployed_by_email: deployedByEmail,
        tool_name: toolName,
        logs,
        metadata,
        error_message: errorMessage,
      },
    });
  }

  async updateDeploymentStatus(deploymentId: string, status: string) {
    return await this.prisma.deployments.update({
      where: { id: deploymentId },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }

  async getDeploymentProgress(deploymentId: string) {
    return await this.prisma.deployments.findUnique({
      where: { id: deploymentId },
      include: {
        deployment_stages: {
          orderBy: { timestamp: 'asc' },
        },
        deployer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        projects: {
          select: {
            id: true,
            title: true,
            unique_name: true,
          },
        },
      },
    });
  }

  async getProjectDeployments(projectId: string) {
    return await this.prisma.deployments.findMany({
      where: { project_id: projectId },
      include: {
        deployment_stages: {
          orderBy: { timestamp: 'asc' },
        },
        deployer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  mapToolNameToStage(toolName: string): DeploymentStage {
    const toolStageMap: Record<string, DeploymentStage> = {
      lightsail_create_instance: DeploymentStage.CREATING_VM,
      lightsail_configure_environment: DeploymentStage.CONFIGURING_ENVIRONMENT,
      lightsail_deploy_code: DeploymentStage.DEPLOYING_CODE,
      lightsail_setup_dns: DeploymentStage.SETTING_UP_DNS,
      lightsail_health_check: DeploymentStage.HEALTH_CHECK,
      lightsail_deploy: DeploymentStage.CREATING_VM,
    };

    if (
      toolName.toLowerCase().includes('lightsail') ||
      toolName.toLowerCase().includes('deploy')
    ) {
      return toolStageMap[toolName] || DeploymentStage.CREATING_VM;
    }

    return DeploymentStage.INITIALIZING;
  }

  determineStageStatus(toolResult: any): StageStatus {
    if (!toolResult) return StageStatus.FAILED;

    if (toolResult.error || toolResult.success === false) {
      return StageStatus.FAILED;
    }

    if (toolResult.success === true || toolResult.status === 'completed') {
      return StageStatus.COMPLETED;
    }

    return StageStatus.IN_PROGRESS;
  }

  async findOrCreateDeploymentFromToolCall(
    toolCall: any,
    toolResult: any,
    projectId: string,
    userId: string,
  ): Promise<string> {
    const deploymentId =
      toolCall.args?.deploymentId || toolCall.args?.deployment_id;

    if (deploymentId) {
      const existingDeployment = await this.prisma.deployments.findUnique({
        where: { id: deploymentId },
      });

      if (existingDeployment) {
        return deploymentId;
      }
    }

    const newDeployment = await this.createDeployment(
      projectId,
      userId,
      userId,
    );
    return newDeployment.id;
  }

  isDeploymentTool(toolName: string): boolean {
    const deploymentToolKeywords = [
      'create_vm',
      'getDeploymentInfo',
      'get_deployment_status',
      'get_deployment_information',
    ];

    return deploymentToolKeywords.some((keyword) =>
      toolName.toLowerCase().includes(keyword),
    );
  }

  async handleDeploymentProgress(
    toolCall: any,
    toolResult: any,
    projectId: string,
    userId: string,
    userEmail: string,
    usage: any,
    finishReason: string,
  ): Promise<void> {
    const deploymentId = await this.findOrCreateDeploymentFromToolCall(
      toolCall,
      toolResult,
      projectId,
      userId,
    );

    const stage = this.mapToolNameToStage(toolCall.toolName);
    const status = this.determineStageStatus(toolResult);
    const logs = toolResult ? JSON.stringify(toolResult) : null;
    const metadata = {
      toolCall: {
        toolName: toolCall.toolName,
        args: toolCall.args,
      },
      usage,
      finishReason,
      timestamp: new Date().toISOString(),
    };

    const errorMessage = toolResult?.error || toolResult?.message || null;

    await this.createDeploymentStage(
      deploymentId,
      stage,
      status,
      userId,
      userEmail,
      toolCall.toolName,
      logs,
      metadata,
      errorMessage,
    );

    let deploymentStatus = 'in_progress';
    if (status === 'FAILED') {
      deploymentStatus = 'failed';
    } else if (status === 'COMPLETED' && stage === 'COMPLETED') {
      deploymentStatus = 'completed';
    }

    await this.updateDeploymentStatus(deploymentId, deploymentStatus);
  }
}
