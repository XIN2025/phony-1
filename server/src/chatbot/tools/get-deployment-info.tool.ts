import { z } from 'zod';
import { PrismaService } from 'src/prisma/prisma.service';

export const getDeploymentInfoTool = (prisma: PrismaService) => ({
  description:
    'Get deployment information for a project to determine if VM exists or needs to be created',
  parameters: z.object({
    projectId: z
      .string()
      .describe('The project ID to get deployment information for'),
  }),
  execute: async ({ projectId }: { projectId: string }) => {
    try {
      const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          title: true,
          unique_name: true,
          created_at: true,
        },
      });

      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          hasExistingDeployment: false,
          shouldCreateVM: true,
        };
      }

      const latestDeployment = await prisma.deployments.findFirst({
        where: { project_id: projectId },
        orderBy: { created_at: 'desc' },
        include: {
          deployer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      const hasExistingDeployment = !!latestDeployment;
      let shouldCreateVM = true;
      let deploymentStatus = 'none';
      let recommendation = 'create_vm';

      if (latestDeployment) {
        deploymentStatus = latestDeployment.status;

        if (
          deploymentStatus === 'completed' ||
          deploymentStatus === 'in_progress' ||
          (latestDeployment.vm_ip_address && latestDeployment.instance_ip)
        ) {
          shouldCreateVM = false;
          recommendation = 'redeploy';
        }

        if (deploymentStatus === 'failed') {
          shouldCreateVM = true;
          recommendation = 'create_vm';
        }
      }

      return {
        success: true,
        project: {
          id: project.id,
          title: project.title,
          unique_name: project.unique_name,
          created_at: project.created_at,
        },
        hasExistingDeployment,
        shouldCreateVM,
        recommendation,
        latestDeployment: latestDeployment
          ? {
              id: latestDeployment.id,
              status: latestDeployment.status,
              vm_ip_address: latestDeployment.vm_ip_address,
              instance_ip: latestDeployment.instance_ip,
              deployment_url: latestDeployment.deployment_url,
              progress_url: latestDeployment.progress_url,
              message: latestDeployment.message,
              created_at: latestDeployment.created_at,
              updated_at: latestDeployment.updated_at,
              deployer: latestDeployment.deployer
                ? {
                    name: `${latestDeployment.deployer.first_name} ${latestDeployment.deployer.last_name}`,
                    email: latestDeployment.deployer.email,
                  }
                : null,
            }
          : null,
        deploymentHistory: {
          totalDeployments: hasExistingDeployment ? 1 : 0,
          lastDeployedAt: latestDeployment?.created_at || null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        hasExistingDeployment: false,
        shouldCreateVM: true,
        recommendation: 'create_vm',
      };
    }
  },
});
