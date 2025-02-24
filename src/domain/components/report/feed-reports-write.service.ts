import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { Transactional } from '@nestjs-cls/transactional';
import { BlockedFeedsService } from 'src/domain/components/feed/blocked-feeds.service';

@Injectable()
export class FeedReportsWriteService {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    private readonly blockedFeedsService: BlockedFeedsService,
  ) {}

  @Transactional()
  async report(prototype: ReportPrototype) {
    const { reportedId: feedId, reporterId: userId } = prototype;
    await this.saveReport(prototype);
    await this.blockFeed(userId, feedId);
  }

  async saveReport(prototype: ReportPrototype) {
    const stdDate = new Date();
    const report = ReportEntity.create(prototype, v4, stdDate);
    await this.reportsRepository.save(report);
  }

  async blockFeed(userId: string, feedId: string) {
    await this.blockedFeedsService.block(userId, feedId);
  }
}
