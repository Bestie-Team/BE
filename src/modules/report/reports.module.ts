import { Module } from '@nestjs/common';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { FriendReportsWriteSerivce } from 'src/domain/services/report/friend-reports-write.service';
import { ReportsPrismaRepository } from 'src/infrastructure/repositories/report/reports-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { ReportsController } from 'src/presentation/controllers/report/reports.controller';

@Module({
  imports: [FriendsModule, GatheringParticipationModules],
  controllers: [ReportsController],
  providers: [
    FriendReportsWriteSerivce,
    { provide: ReportsRepository, useClass: ReportsPrismaRepository },
  ],
})
export class ReportsModule {}
