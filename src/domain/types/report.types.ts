import { ReportTypes } from 'src/shared/types';

export interface ReportPrototype {
  readonly id: string;
  readonly reporterId: string;
  readonly reportedId: string;
  readonly type: ReportTypes;
  readonly reason: string;
}
