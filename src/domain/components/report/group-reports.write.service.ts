import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { GroupParticipationStatus } from 'src/shared/types';
import { GroupParticipationsWriter } from 'src/domain/components/group/group-participations-writer';

@Injectable()
export class GroupReportsWriteService {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    private readonly groupParticipationsWriter: GroupParticipationsWriter,
  ) {}

  @Transactional()
  async report(prototype: ReportPrototype) {
    const { reportedId: groupId, reporterId } = prototype;
    await this.saveReport(prototype);
    await this.updateStatus(groupId, reporterId, 'REPORTED');
  }

  private async saveReport(prototype: ReportPrototype) {
    const stdDate = new Date();
    const report = ReportEntity.create(prototype, v4, stdDate);
    await this.reportsRepository.save(report);
  }

  private async updateStatus(
    groupId: string,
    participantId: string,
    status: GroupParticipationStatus,
  ) {
    await this.groupParticipationsWriter.updateStatus(
      groupId,
      participantId,
      status,
    );
  }
}
