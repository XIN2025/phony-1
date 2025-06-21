import {
  SchedulerClient,
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler';
import { Injectable } from '@nestjs/common';

const client = new SchedulerClient({
  region: process.env.AWS_EVENTBRIDGE_REGION,
  credentials: {
    accessKeyId: process.env.AWS_EVENTBRIDGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_EVENTBRIDGE_SECRET_ACCESS_KEY,
  },
});

interface CronScheduleParams {
  eventId: string;
  cronExpression: string;
  payload: any;
  startDate?: string | Date;
  endDate?: string | Date;
  timezone: string;
}

@Injectable()
export class SchedulerService {
  async createCronSchedule({
    eventId,
    cronExpression,
    payload,
    startDate,
    endDate,
    timezone,
  }: CronScheduleParams) {
    try {
      const params: CreateScheduleCommandInput = {
        Name: eventId,
        GroupName: 'devtools',
        ScheduleExpression: `cron(${cronExpression})`,
        StartDate: startDate ? new Date(startDate) : undefined,
        EndDate: endDate ? new Date(endDate) : undefined,
        ScheduleExpressionTimezone: timezone,
        Description: `Scheduled cron job ${cronExpression}`,
        State: 'ENABLED',
        Target: {
          Arn: 'arn:aws:lambda:ap-south-1:533267176094:function:send_email',
          RoleArn: 'arn:aws:iam::533267176094:role/EventBridgeApiGatewayRole',
          Input: JSON.stringify(payload),
          RetryPolicy: {
            MaximumEventAgeInSeconds: 86400,
            MaximumRetryAttempts: 2,
          },
        },
        FlexibleTimeWindow: {
          Mode: 'OFF',
        },
      };
      // Delete the schedule if it already exists
      await this.deleteSchedule(eventId);
      const command = new CreateScheduleCommand(params);
      const response = await client.send(command);
      console.log(`Cron job schedule created: ${response.ScheduleArn}`);
    } catch (error) {
      console.log(`Error creating cron job schedule: ${error}`);
    }
  }

  async deleteSchedule(scheduleName: string, groupName = 'devtools') {
    try {
      const params = {
        Name: scheduleName,
        GroupName: groupName,
      };

      const command = new DeleteScheduleCommand(params);
      await client.send(command);
      console.log(`Schedule deleted: ${scheduleName}`);
    } catch (error) {
      console.log(`Error deleting schedule: ${error}`);
    }
  }
}
