import { Test, TestingModule } from '@nestjs/testing';
import { GitController } from './git.controller';
import { GitService } from './git.service';

describe('GitController', () => {
  let controller: GitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitController],
      providers: [GitService],
    }).compile();

    controller = module.get<GitController>(GitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
