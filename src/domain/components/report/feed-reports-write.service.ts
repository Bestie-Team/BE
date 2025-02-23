import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class FeedReportsWriteService {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    @Inject(BlockedFeedsRepository)
    private readonly blockedFeedsRepository: BlockedFeedsRepository,
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
    const stdDate = new Date();
    const block = BlockedFeedEntity.create({ userId, feedId }, stdDate);
    await this.blockedFeedsRepository.save(block);
  }
}
