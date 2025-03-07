import { ReportTypes } from 'src/shared/types';

export interface ReportPrototype {
  readonly reporterId: string;
  readonly reportedId: string;
  readonly type: ReportTypes;
  readonly reason: string;
}
