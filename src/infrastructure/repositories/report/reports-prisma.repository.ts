import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';

@Injectable()
export class ReportsPrismaRepository implements ReportsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: ReportEntity): Promise<void> {
    await this.txHost.tx.report.create({
      data,
    });
  }
}
