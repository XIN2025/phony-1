import { Injectable, Logger } from '@nestjs/common';
import { RecordingStatus, RecordingUser } from './types';
import { Server, Socket } from 'socket.io';

@Injectable()
export class RtcService {
  private readonly logger: Logger = new Logger(RtcService.name);
  private recordingUsers: Map<string, RecordingUser[]> = new Map(); // projectId -> recording users
  private socketToProject: Map<string, string> = new Map(); // socketId -> projectId

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket, io: Server) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    const projectIds = this.findRecordingProjectsBySocketId(client.id);
    for (const projectId of projectIds) {
      this.removeUserFromRecording(client.id, io, projectId);
    }
    this.socketToProject.delete(client.id);
  }

  async handleJoinProject(client: Socket, projectId: string) {
    // Leave any existing project room
    this.logger.debug(`Client ${client.id} joining project ${projectId}`);
    const currentProject = this.socketToProject.get(client.id);
    if (currentProject) {
      await client.leave(currentProject);
    }

    // Join new project room
    await client.join(projectId);
    this.socketToProject.set(client.id, projectId);

    // Send current recording users to the newly joined client
    const projectUsers = this.recordingUsers.get(projectId) || [];
    client.emit('recordingUsers', {
      projectId,
      users: projectUsers,
    });
  }

  async handleStartRecording(
    client: Socket,
    io: Server,
    data: RecordingStatus,
  ) {
    const { projectId, user } = data;

    const projectUsers = this.recordingUsers.get(projectId) || [];

    const recordingUser: RecordingUser = {
      ...user,
      socketId: client.id,
    };

    if (!projectUsers?.some((u) => u.socketId === client.id)) {
      projectUsers?.push(recordingUser);
      this.recordingUsers.set(projectId, projectUsers);
      io.to(projectId).emit('recordingUsers', {
        projectId,
        users: projectUsers,
      });
    }
  }

  async handleLeaveProject(client: Socket, projectId: string) {
    await client.leave(projectId);
    if (this.socketToProject.get(client.id) === projectId) {
      this.socketToProject.set(client.id, null);
    }
  }

  async handleStopRecording(client: Socket, io: Server, projectId: string) {
    this.removeUserFromRecording(client.id, io, projectId);
  }
  private findRecordingProjectsBySocketId(socketId: string) {
    const projects = this.recordingUsers.entries();
    const projectIds = [];
    for (const [projectId, users] of projects) {
      if (users.some((user) => user.socketId === socketId)) {
        projectIds.push(projectId);
      }
    }
    return projectIds;
  }

  private removeUserFromRecording(
    socketId: string,
    io: Server,
    projectId: string,
  ) {
    const projectUsers = this.recordingUsers.get(projectId) || [];
    if (projectUsers.length > 0) {
      const updatedUsers = projectUsers.filter(
        (user) => user.socketId !== socketId,
      );
      this.recordingUsers.set(projectId, updatedUsers);

      io.to(projectId).emit('recordingUsers', {
        projectId,
        users: updatedUsers,
      });
    }
  }
}
