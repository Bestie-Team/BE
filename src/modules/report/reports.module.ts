import { Module } from '@nestjs/common';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { FeedCommentReportsWriteService } from 'src/domain/services/report/feed-comment-reports-write.service';
import { FeedReportsWriteService } from 'src/domain/services/report/feed-reports-write.service';
import { FriendReportsWriteSerivce } from 'src/domain/services/report/friend-reports-write.service';
import { GroupReportsWriteService } from 'src/domain/services/report/group-reports.write.service';
import { ReportsPrismaRepository } from 'src/infrastructure/repositories/report/reports-prisma.repository';
import { FeedsModule } from 'src/modules/feed/feeds.module';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GroupsModule } from 'src/modules/group/groups.module';
import { ReportsController } from 'src/presentation/controllers/report/reports.controller';

@Module({
  imports: [
    FriendsModule,
    GatheringParticipationModules,
    GroupsModule,
    FeedsModule,
  ],
  controllers: [ReportsController],
  providers: [
    FriendReportsWriteSerivce,
    GroupReportsWriteService,
    FeedReportsWriteService,
    FeedCommentReportsWriteService,
    { provide: ReportsRepository, useClass: ReportsPrismaRepository },
  ],
})
export class ReportsModule {}
