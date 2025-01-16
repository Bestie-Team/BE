import { ApiProperty } from '@nestjs/swagger';
import { PaginationRequest } from '../../shared';
import { IsDateString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GatheringListRequest extends PaginationRequest {
  @ApiProperty()
  @IsDateString({}, { message: 'minDate가 ISO8601 형식이 아닙니다.' })
  minDate: string;

  @ApiProperty()
  @IsDateString({}, { message: 'maxDate가 ISO8601 형식이 아닙니다.' })
  maxDate: string;

  @ApiProperty()
  @IsDateString({}, { message: 'cursor가 ISO8601이 아닙니다.' })
  readonly cursor: string;

  @ApiProperty()
  @IsInt({ message: 'limit이 정수가 아닙니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
