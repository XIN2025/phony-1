import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RecordingStatus } from './types';
import { RtcService } from './rtc.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    credentials: true,
  },
})
export class RtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly rtcService: RtcService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.rtcService.handleConnection(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.rtcService.handleDisconnect(client, this.server);
  }

  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    this.rtcService.handleJoinProject(client, projectId);
  }

  @SubscribeMessage('startRecording')
  async handleStartRecording(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Omit<RecordingStatus, 'user.socketId'>,
  ) {
    this.rtcService.handleStartRecording(client, this.server, data);
  }

  @SubscribeMessage('stopRecording')
  async handleStopRecording(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RecordingStatus,
  ) {
    this.rtcService.handleStopRecording(client, this.server, data.projectId);
  }

  @SubscribeMessage('leaveProject')
  async handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    this.rtcService.handleLeaveProject(client, projectId);
  }
}
