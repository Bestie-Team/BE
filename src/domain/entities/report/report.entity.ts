import { ReportPrototype } from 'src/domain/types/report.types';
import { ReportTypes } from 'src/shared/types';

export class ReportEntity {
  readonly id: string;
  readonly reporterId: string;
  readonly reportedId: string;
  readonly type: ReportTypes;
  readonly reason: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static create(
    proto: ReportPrototype,
    idGen: () => string,
    stdDate: Date,
  ): ReportEntity {
    return {
      ...proto,
      id: idGen(),
      createdAt: stdDate,
      updatedAt: stdDate,
    };
  }
}
