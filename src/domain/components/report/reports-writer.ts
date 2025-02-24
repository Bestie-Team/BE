import { Inject, Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';

@Injectable()
export class ReportsWriter {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async report(report: ReportEntity) {
    await this.reportsRepository.save(report);
  }
}
