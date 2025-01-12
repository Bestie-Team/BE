import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { PaginationRequest } from '../../shared';

export class GatheringInvitationListRequest extends PaginationRequest {
  @ApiProperty()
  @IsDateString()
  minDate: string;

  @ApiProperty()
  @IsDateString()
  maxDate: string;
}
