import { Transform } from 'class-transformer';
import { IsInt, Length } from 'class-validator';

export class UserPaginationRequest {
  @Length(2, 20, { message: '커서는 2자 이상 20자 이하만 가능합니다.' })
  cursor: string;

  @IsInt({ message: 'limit은 정수만 가능합니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit: number;
}
