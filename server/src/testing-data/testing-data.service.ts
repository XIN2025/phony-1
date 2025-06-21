import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { testing_data, TestType, Prisma } from '@prisma/client';
import { CreateTestingDataDto } from './dtos/testing-data.dto';

type InputJsonValue = Prisma.InputJsonValue;

@Injectable()
export class TestingDataService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTestingDataDto: CreateTestingDataDto,
  ): Promise<testing_data> {
    const { projectName, type, testResults } = createTestingDataDto;

    const project = await this.prisma.projects.findUnique({
      where: {
        unique_name: projectName,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.testing_data.create({
      data: {
        project_id: project.id,
        type: type as TestType,
        testResults: testResults as unknown as InputJsonValue[],
      },
    });
  }

  async findByProjectId(projectId: string): Promise<testing_data[]> {
    return this.prisma.testing_data.findMany({
      where: { project_id: projectId },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
