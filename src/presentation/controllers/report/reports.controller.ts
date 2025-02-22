import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ValidateReportTypePipe } from 'src/common/pipes/validate-report-type.pipe';
import { FeedCommentReportsWriteService } from 'src/domain/services/report/feed-comment-reports-write.service';
import { FeedReportsWriteService } from 'src/domain/services/report/feed-reports-write.service';
import { FriendReportsWriteSerivce } from 'src/domain/services/report/friend-reports-write.service';
import { GroupReportsWriteService } from 'src/domain/services/report/group-reports.write.service';
import { ReportPrototype } from 'src/domain/types/report.types';
import { CreateReportRequest } from 'src/presentation/dto/report/request/create-report.request';
import { ReportTypes } from 'src/shared/types';

@ApiTags('/reports')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly friendReportWriteService: FriendReportsWriteSerivce,
    private readonly groupReportWriteService: GroupReportsWriteService,
    private readonly feedReportsWriteService: FeedReportsWriteService,
    private readonly feedCommentReportsWriteService: FeedCommentReportsWriteService,
  ) {}

  @ApiOperation({ summary: '신고' })
  @ApiResponse({
    status: 201,
    description: '신고 완료',
  })
  @Post()
  async reportFriend(
    @Body() dto: CreateReportRequest,
    @CurrentUser() userId: string,
  ) {
    // TODO service 코드 수정 후 분기 제거하고 레이어 나누기.
    const { type } = dto;
    const input: ReportPrototype = { ...dto, reporterId: userId };
    type === 'FRIEND'
      ? await this.friendReportWriteService.report(input)
      : type === 'GROUP'
      ? await this.groupReportWriteService.report(input)
      : type === 'FEED'
      ? await this.feedReportsWriteService.report(input)
      : await this.feedCommentReportsWriteService.report(input);
  }
}
