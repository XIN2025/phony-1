import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectUtils {
  constructor() {}

  getProjectFolder = (projectId: string): string => {
    const projectPath = process.env.PROJECT_ROOT_PATH;
    const rootFolder = path.join(process.cwd(), '..');
    const projectFolder = path.join(rootFolder, projectPath, projectId);
    return projectFolder;
  };

  async cleanupProject(projectId: string): Promise<void> {
    try {
      const projectFolder = this.getProjectFolder(projectId);
      console.log('cleanup projectFolder ' + projectFolder);
      if (fsSync.existsSync(projectFolder)) {
        fsSync.rmSync(projectFolder, { recursive: true });
      }
    } catch (error) {
      console.error('Error cleaning up project:', error);
    }
  }

  async createProjectFolder(projectId: string): Promise<string> {
    const projectPath = process.env.PROJECT_ROOT_PATH;
    const rootFolder = path.join(process.cwd(), '..');
    const projectFolder = path.join(rootFolder, projectPath, projectId);

    try {
      await fs.mkdir(projectFolder, { recursive: true });
      console.log(`Project folder created at: ${projectFolder}`);
      return projectFolder;
    } catch (error) {
      console.error(`Failed to create project folder for ${projectId}`);
      throw new Error(`Failed to create project folder for ${projectId}`);
    }
  }

  async writeFileOrCreate(filePath: string, content: string) {
    try {
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error(`Error writing file: ${filePath} (${error})`);
    }
  }
}
