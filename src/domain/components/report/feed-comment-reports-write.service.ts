import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { BlockedFeedCommentRepository } from 'src/domain/interface/feed-comment/blocked-feed-comment.repository';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { v4 } from 'uuid';

@Injectable()
export class FeedCommentReportsWriteService {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    @Inject(BlockedFeedCommentRepository)
    private readonly blockedFeedCommentRepository: BlockedFeedCommentRepository,
  ) {}

  @Transactional()
  async report(prototype: ReportPrototype) {
    const stdDate = new Date();
    const report = ReportEntity.create(prototype, v4, stdDate);
    await this.reportsRepository.save(report);
    await this.blockComment(
      prototype.reporterId,
      prototype.reportedId,
      stdDate,
    );
  }

  async blockComment(userId: string, commentId: string, now = new Date()) {
    await this.blockedFeedCommentRepository.save({
      userId,
      commentId,
      createdAt: now,
    });
  }
}
