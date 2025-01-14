import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { PaginationRequest } from '../../shared';

export class GatheringInvitationListRequest extends PaginationRequest {
  @ApiProperty()
  @IsDateString({}, { message: 'ISO8601 형식이 아닙니다.' })
  minDate: string;

  @ApiProperty()
  @IsDateString({}, { message: 'ISO8601 형식이 아닙니다.' })
  maxDate: string;
}
