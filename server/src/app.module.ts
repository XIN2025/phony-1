import { Module } from '@nestjs/common';
import { WaitlistModule } from './waitlist/waitlist.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { GitModule } from './git/git.module';
import { MailModule } from './mail/mail.module';
import { TextExtractorService } from './text-extractor/text-extractor.service';
import { TextExtractorModule } from './text-extractor/text-extractor.module';
import { HelperModule } from './helper/helper.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ProjectResourcesModule } from './project-resources/project-resources.module';
import { MeetingDataModule } from './meeting-data/meeting-data.module';
import { EncryptionService } from './utils/encrypt.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { TestingDataModule } from './testing-data/testing-data.module';
import { CicdModule } from './cicd/cicd.module';
import { SecretsModule } from './secrets/secrets.module';
import { UsersModule } from './users/users.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { StoryCommentsModule } from './story-comments/story-comments.module';
import { WikiModule } from './wiki/wiki.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { RtcModule } from './rtc/rtc.module';
import { BugsModule } from './bugs/bugs.module';
import { RagModule } from './rag/rag.module';
import { LokiOptions } from 'pino-loki/index';
import { PaymentModule } from './payment/payment.module';
import { WorklogModule } from './worklog/worklog.module';

@Module({
  imports: [
    WaitlistModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                hideObject: true,
                ignore: 'pid,hostname',
                messageFormat:
                  '[{req.id}] {req.method} {req.url} - {msg}  {res.statusCode} {responseTime}',
              },
            },
            ...(process.env.NODE_ENV !== 'development'
              ? [
                  {
                    target: 'pino-loki',
                    options: {
                      host: process.env.LOKI_HOST,
                      basicAuth: {
                        username: process.env.LOKI_USERNAME,
                        password: process.env.LOKI_PASSWORD,
                      },
                      labels: {
                        app: process.env.NODE_ENV,
                      },
                      replaceTimestamp: true,
                    } satisfies LokiOptions,
                  },
                ]
              : []),
          ],
        },
        redact: ['req.headers', 'res.headers'],
        level: 'debug',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ProjectModule,
    GitModule,
    MailModule,
    TextExtractorModule,
    HelperModule,
    IntegrationsModule,
    ProjectResourcesModule,
    MeetingDataModule,
    TasksModule,
    TestingDataModule,
    CicdModule,
    SecretsModule,
    AnalyticsModule,
    UsersModule,
    FeatureFlagsModule,
    StoryCommentsModule,
    WikiModule,
    ChatbotModule,
    RtcModule,
    BugsModule,
    RagModule,
    PaymentModule,
    WorklogModule,
  ],
  controllers: [AppController],
  providers: [AppService, TextExtractorService, EncryptionService],
})
export class AppModule {}
