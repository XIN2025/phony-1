import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingDataService } from '../meeting-data/meeting-data.service';
import { DeepgramService } from 'src/utils/deepgram.service';
import { S3Service } from 'src/utils/s3.service';
@Injectable()
export class ProjectTranscriptionService {
  private readonly logger = new Logger(ProjectTranscriptionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetingDataService: MeetingDataService,
    private readonly deepgramService: DeepgramService,
    private readonly s3Service: S3Service,
  ) {}

  private async getProjectOwnerId(projectId: string): Promise<string> {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    return project.owner_id;
  }

  private async validateMeetingCredits(
    userId: string,
    durationInSeconds: number,
  ): Promise<number> {
    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    this.logger.debug(`Duration in Minute ${durationInMinutes}`);
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.debug('User Not Found in validateMeetingCredits');
      throw new BadRequestException('User not found');
    }

    if (user.meeting_credits_remaining < durationInMinutes) {
      this.logger.debug(
        `Insufficient meeting credits. Required: ${durationInMinutes} minutes, Available: ${user.meeting_credits_remaining} minutes for ${user.email}`,
      );
      throw new BadRequestException(
        `Insufficient meeting credits. Required: ${durationInMinutes} minutes, Available: ${user.meeting_credits_remaining} minutes`,
      );
    }

    return durationInMinutes;
  }

  private async updateMeetingCredits(
    userId: string,
    durationInMinutes: number,
  ): Promise<void> {
    this.logger.debug("Updating user's meeting credits " + durationInMinutes);
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        meeting_credits_used: { increment: durationInMinutes },
        meeting_credits_remaining: { decrement: durationInMinutes },
      },
    });
  }

  async transcribeAudio(
    audioFile: Express.Multer.File,
    projectId: string | null,
    startDate: string,
    endDate: string,
    audioDuration: string,
    createdBy: string,
  ) {
    try {
      // Get project owner's ID
      this.logger.debug('Fetching OwnerId');
      const ownerId = projectId
        ? await this.getProjectOwnerId(projectId)
        : createdBy;
      this.logger.debug(`OwnerId : ${ownerId}`);

      this.uploadAudio(audioFile, ownerId);
      // Validate meeting credits before processing
      const durationInMinutes = await this.validateMeetingCredits(
        ownerId,
        parseInt(audioDuration),
      );

      const transcriptionOptions = {
        model: 'nova-3',
        detect_entities: true,
        smart_format: true,
        diarize: true,
      };

      // Use the retry mechanism for transcription
      const transcript = await this.deepgramService.transcribeWithRetry(
        audioFile.buffer,
        transcriptionOptions,
        3, // Maximum 3 retries
      );

      if (!transcript) {
        console.warn('No transcript generated');
        throw new Error('No transcript generated');
      }
      this.logger.debug('Got the transcript');
      const meetingData = await this.meetingDataService.create({
        projectId: projectId ?? null,
        transcript,
        createdBy,
        metadata: {
          startDate,
          endDate,
          durationInSeconds: parseInt(audioDuration),
        },
      });

      // Update credits only after successful transcription and storage
      await this.updateMeetingCredits(ownerId, durationInMinutes);
      return { transcript, meetingData };
    } catch (error) {
      console.error('Transcription error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to transcribe audio',
        error.status || 500,
      );
    }
  }
  async uploadAudio(
    audioFile: Express.Multer.File,
    userId: string,
  ): Promise<{ key: string; url: string }> {
    const timestamp = new Date().getTime();
    const key = `recordings/${userId}/${timestamp}.mp3`;

    try {
      return await this.s3Service.uploadFile(audioFile, key);
    } catch (error) {
      throw new Error('Failed to upload audio to S3');
    }
  }
}
