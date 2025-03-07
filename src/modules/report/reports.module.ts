import { Module } from '@nestjs/common';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { FeedCommentReportsWriteService } from 'src/domain/components/report/feed-comment-reports-write.service';
import { FeedReportsWriteService } from 'src/domain/components/report/feed-reports-write.service';
import { FriendReportsWriteSerivce } from 'src/domain/components/report/friend-reports-write.service';
import { GroupReportsWriteService } from 'src/domain/components/report/group-reports.write.service';
import { ReportsWriter } from 'src/domain/components/report/reports-writer';
import { ReportsPrismaRepository } from 'src/infrastructure/repositories/report/reports-prisma.repository';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { ReportsController } from 'src/presentation/controllers/report/reports.controller';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { BlockedFeedsModule } from 'src/modules/feed/blocked-feeds.module';
import { FriendsComponentModule } from 'src/modules/friend/friends-componenet.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';

@Module({
  imports: [
    FriendsComponentModule,
    GatheringParticipationModules,
    GroupParticipationsModule,
    BlockedFeedsModule,
    FeedsComponentModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportsWriter,
    FriendReportsWriteSerivce,
    GroupReportsWriteService,
    FeedReportsWriteService,
    FeedCommentReportsWriteService,
    { provide: ReportsRepository, useClass: ReportsPrismaRepository },
  ],
})
export class ReportsModule {}
