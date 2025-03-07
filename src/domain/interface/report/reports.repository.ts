import { ReportEntity } from 'src/domain/entities/report/report.entity';

export interface ReportsRepository {
  save(data: ReportEntity): Promise<void>;
}

export const ReportsRepository = Symbol('ReportsRepository');
