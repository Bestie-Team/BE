import { ApiProperty } from '@nestjs/swagger';
import { PaginationRequest } from '../../shared';
import { IsDateString } from 'class-validator';

export class GatheringListRequest extends PaginationRequest {
  @ApiProperty()
  @IsDateString({}, { message: 'minDate가 ISO8601 형식이 아닙니다.' })
  minDate: string;

  @ApiProperty()
  @IsDateString({}, { message: 'maxDate가 ISO8601 형식이 아닙니다.' })
  maxDate: string;
}
