import { Module } from '@nestjs/common';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { FriendReportsWriteSerivce } from 'src/domain/services/report/friend-reports-write.service';
import { ReportsPrismaRepository } from 'src/infrastructure/repositories/report/reports-prisma.repository';
import { ReportsController } from 'src/presentation/controllers/report/reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [
    FriendReportsWriteSerivce,
    { provide: ReportsRepository, useClass: ReportsPrismaRepository },
  ],
})
export class ReportsModule {}
