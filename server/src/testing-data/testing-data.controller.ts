import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TestingDataService } from './testing-data.service';
import {
  CreateTestingDataDto,
  TestingDataDto,
  mapToTestingDataDto,
} from './dtos/testing-data.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('testing-data')
@Controller('testing-data')
@ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class TestingDataController {
  constructor(private readonly testingDataService: TestingDataService) {}

  @Post()
  async create(
    @Body() createTestingDataDto: CreateTestingDataDto,
  ): Promise<TestingDataDto> {
    const testingData =
      await this.testingDataService.create(createTestingDataDto);
    return mapToTestingDataDto(testingData);
  }

  @Get('testing-data/:projectId')
  async findByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<TestingDataDto[]> {
    const testingData =
      await this.testingDataService.findByProjectId(projectId);
    return testingData.map((data) => mapToTestingDataDto(data));
  }
}
