import { Inject, Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { v4 } from 'uuid';

@Injectable()
export class FeedCommentReportsWriteService {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async report(prototype: ReportPrototype) {
    const stdDate = new Date();
    const report = ReportEntity.create(prototype, v4, stdDate);
    await this.reportsRepository.save(report);
  }
}
