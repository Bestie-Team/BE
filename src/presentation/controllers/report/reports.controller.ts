import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendReportsWriteSerivce } from 'src/domain/services/report/friend-reports-write.service';
import { CreateReportRequest } from 'src/presentation/dto/report/request/create-report.request';

@ApiTags('/reports')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly friendReportsWriteService: FriendReportsWriteSerivce,
  ) {}

  @Post('friends')
  async reportFriend(
    @Body() dto: CreateReportRequest,
    @CurrentUser() userId: string,
  ) {
    await this.friendReportsWriteService.report({ ...dto, reporterId: userId });
  }
}
