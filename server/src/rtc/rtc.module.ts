import { Module } from '@nestjs/common';
import { RtcService } from './rtc.service';
import { RtcGateway } from './rtc.gateway';

@Module({
  providers: [RtcService, RtcGateway],
  exports: [RtcService],
})
export class RtcModule {}
