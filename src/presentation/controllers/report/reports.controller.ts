import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('/reports')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class ReportsController {}
