import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { GroupParticipationStatus } from 'src/shared/types';
import { v4 } from 'uuid';

@Injectable()
export class GroupReportsWriteService {
  constructor(
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  @Transactional()
  async report(prototype: ReportPrototype) {
    const { reportedId: groupId } = prototype;
    await this.saveReport(prototype);
    await this.updateStatus(groupId, 'REPORTED');
  }

  private async saveReport(prototype: ReportPrototype) {
    const stdDate = new Date();
    const report = ReportEntity.create(prototype, v4, stdDate);
    await this.reportsRepository.save(report);
  }

  private async updateStatus(
    groupId: string,
    status: GroupParticipationStatus,
  ) {
    await this.groupParticipationsRepository.update(groupId, { status });
  }
}
