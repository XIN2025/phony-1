import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface ModelInfo {
  id: string;
  modelName?: string;
  maxTokens?: number;
  contextWindow?: number;
  supportsImages?: boolean;
  supportsComputerUse?: boolean;
  supportsPromptCache: boolean; // this value is hardcoded for now
  inputPrice?: number;
  outputPrice?: number;
  cacheWritesPrice?: number;
  cacheReadsPrice?: number;
  description?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    const formatBytes = (bytes: number): string => {
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const formatUptime = (seconds: number): string => {
      const days = Math.floor(seconds / (24 * 60 * 60));
      const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
    };

    const memory = process.memoryUsage();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: formatUptime(process.uptime()),
      memoryUsage: {
        heapUsed: formatBytes(memory.heapUsed),
        heapTotal: formatBytes(memory.heapTotal),
        rss: formatBytes(memory.rss),
        external: formatBytes(memory.external),
      },
    };
  }

  @Get('models')
  getModels() {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        maxTokens: 8192,
        contextWindow: 200_000,
        supportsImages: true,
        supportsComputerUse: true,
        supportsPromptCache: true,
        inputPrice: 3.0,
        outputPrice: 15.0,
        cacheWritesPrice: 3.75,
        cacheReadsPrice: 0.3,
        modelName: 'opengig-coder',
      },
      {
        id: 'gemini-2.0-flash-001',
        maxTokens: 8192,
        contextWindow: 1_048_576,
        supportsImages: true,
        supportsPromptCache: false,
        inputPrice: 0.1,
        outputPrice: 0.4,
        cacheReadsPrice: 0.025,
        cacheWritesPrice: 0.1,
        modelName: 'opengig-long-context',
        supportsComputerUse: false,
      },
    ] as ModelInfo[];
  }
}
