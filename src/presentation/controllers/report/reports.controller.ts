import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportUseCase } from 'src/application/use-case/report-use-case';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ValidateReportTypePipe } from 'src/common/pipes/validate-report-type.pipe';
import { CreateReportRequest } from 'src/presentation/dto/report/request/create-report.request';
import { ReportTypes } from 'src/shared/types';

@ApiTags('/reports')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportUseCase: ReportUseCase) {}

  @Post(':type')
  async reportFriend(
    @Param('type', ValidateReportTypePipe) type: ReportTypes,
    @Body() dto: CreateReportRequest,
    @CurrentUser() userId: string,
  ) {
    await this.reportUseCase.excute(type, { ...dto, reporterId: userId });
  }
}
