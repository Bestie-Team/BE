import { Injectable } from '@nestjs/common';
import { FriendReportsWriteSerivce } from 'src/domain/services/report/friend-reports-write.service';
import { ReportPrototype } from 'src/domain/types/report.types';
import { ReportTypes } from 'src/shared/types';

@Injectable()
export class ReportUseCase {
  constructor(
    private readonly friendReportsWriteService: FriendReportsWriteSerivce,
  ) {}

  async excute(type: ReportTypes, input: ReportPrototype) {
    if (type === 'FRIEND') {
      await this.friendReportsWriteService.report(input);
    }
  }
}
