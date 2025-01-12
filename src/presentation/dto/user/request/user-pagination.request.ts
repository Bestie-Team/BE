import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, Length, ValidateNested } from 'class-validator';

class UserCursor {
  @Length(1, 20, { message: '이름 커서는 1자 이상 20자 이하입니다.' })
  readonly name: string;

  @Length(1, 15, { message: '계정 아이디 커서는 1자 이상 15자 이하입니다.' })
  readonly accountId: string;
}

export class UserPaginationRequest {
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => UserCursor)
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value); // JSON 문자열을 객체로 변환;
      return plainToInstance(UserCursor, json);
    } catch {
      throw new Error('Invalid cursor format');
    }
  })
  readonly cursor: UserCursor;

  @IsInt({ message: 'limit은 정수만 가능합니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
