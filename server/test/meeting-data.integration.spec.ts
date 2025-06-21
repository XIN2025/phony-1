/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MeetingDataService } from '../src/meeting-data/meeting-data.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { TextExtractorService } from '../src/text-extractor/text-extractor.service';
import { HelperService } from '../src/helper/helper.service';
import { ConfigModule } from '@nestjs/config';

describe('MeetingDataService Integration Tests', () => {
  let service: MeetingDataService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        MeetingDataService,
        PrismaService,
        TextExtractorService,
        HelperService,
      ],
    }).compile();

    service = module.get<MeetingDataService>(MeetingDataService);
  });

  describe('getRelevantTranscript', () => {
    it.skip('should handle a complex technical discussion', async () => {
      const transcript = `Speaker 2: Alright, um, thanks everyone for hopping on. Hope you're all doing well. Uh, Speaker 0, how’s your day going so far?

Speaker 0: Oh, it's been a bit crazy, you know, back-to-back meetings, but yeah, good! I just grabbed a coffee, so I should be fine.

Speaker 1: Haha, sounds like a typical day. What’s your go-to coffee?

Speaker 0: Oh, I just go for a simple black coffee, nothing fancy. Um, yeah. Anyway—uh, so I was talking to my team earlier, and we were kind of, you know, trying to piece together exactly what we need, and, uh, I think we have, like, a general idea, but yeah, still a few things we’re unsure about.

Speaker 3: Yeah, makes sense. Uh, so from the initial discussions we had over email, it seems like you're looking for—um—something that, uh, helps with, um, event booking? Or, uh, are you more focused on improving, like, an existing booking process?

Speaker 0: Yeah, so, um, right now, a lot of our, um, event booking is, uh, pretty manual, like, we have spreadsheets and, uh, different tools that don’t really, um, talk to each other. And, uh, we end up spending a lot of time just, like, confirming bookings, sending reminders, and manually updating availability, which is, um, frustrating.

Speaker 2: Got it. So, like, booking automation and centralizing everything?

Speaker 0: Yeah, yeah, exactly. Like, for example, um, let’s say—um—when a new booking comes in, we have to manually enter their info into our calendar, then into our payment system, and then, uh, someone has to email the client. It's just, um, too many steps, and, uh, it’s easy for things to, you know, fall through the cracks.

Speaker 1: Mmm, yeah, that makes sense. So, uh, like, would you want, um, a system that just syncs all these tools together or, uh, maybe, like, a custom dashboard where everything is in one place?

Speaker 0: Uh, I guess that’s what we’re trying to figure out. Like, um, my team, uh, they’re comfortable using the current tools, but at the same time, if, uh, we had a way to—um—make everything smoother, that’d be ideal.

Speaker 3: Right, so, uh, question—are all these tools cloud-based, or do you have, uh, any on-premise systems?

Speaker 0: Uh, mostly cloud, um, I think? I can check, but, um, our finance team might still be using—uh, I think—something old-school? Uh, QuickBooks, maybe? But—um—I’d have to confirm that.

Speaker 2: Got it. And, um, in terms of access—uh—who would be using the system? Just internal teams, or do clients need access too?

Speaker 0: Oh, um, good question. Uh, for now, just internal, but, um, eventually, maybe clients too, but not in the first phase.

Speaker 1: Okay, yeah, that makes sense. So, um, we’d probably start with, uh, some API integrations for, like, booking and payment, and then maybe—uh—some automated reminders?

Speaker 0: Oh, yes! Payment is actually a big concern for us. Right now, some clients pay upfront, some pay after the event, and it’s, um, kind of a mess to track. We need a way to, um, streamline that.

Speaker 2: Mm-hmm. And, um, Speaker 0, do you have any, uh, specific security concerns? Like, um, compliance-wise?

Speaker 0: Oh, yeah, yeah, um, data security is a big thing for us, especially, um, with client info and payment details. Uh, I know our legal team will have some requirements, so I’ll, uh, get back to you on that. But, yeah, it’s definitely something we’ll need to think about.

Speaker 3: Makes sense. Uh, we can look into that once we have, uh, more details. Um, also, timeline-wise, are you looking for, um, something immediate, or is this more of, uh, a phased thing?

Speaker 0: Uh, yeah, so, um, ideally, we’d like to see something—uh—a prototype maybe?—within, um, the next two months? Uh, I don’t know if that’s realistic?

Speaker 1: Yeah, uh, we’d need to scope it out properly, but—uh—it sounds doable for an MVP, at least?

Speaker 0: Okay, great. Um, so what’s next? Do you, like, need more details from us, or—uh—how does this work?

Speaker 2: Yeah, um, we’ll put together, like, a high-level, uh, scope document and, uh, get back to you with, like, some recommendations.

Speaker 0: Okay, sounds good! Uh, thanks, everyone.

Speaker 1: Cool, yeah, thanks!

Speaker 3: Yeah, talk soon!`;

      const result = await service.getFilteredTranscript(transcript);

      console.log('Technical discussion results:', result);

      expect(result.length).toBeGreaterThan(0);
    }, 30000);
  });
});
