import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, Length, ValidateNested } from 'class-validator';

class UserCursor {
  @Length(2, 20, { message: '이름은 2자 이상 20자 이하입니다.' })
  readonly name: string;

  @Length(5, 15, { message: '계정 아이디는 5자 이상 15자 이하입니다.' })
  readonly accountId: string;
}

export class UserPaginationRequest {
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => UserCursor)
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value); // JSON 문자열을 객체로 변환;
      const instnace = plainToInstance(UserCursor, json);
      console.log(instnace);
      return instnace;
    } catch {
      throw new Error('Invalid cursor format');
    }
  })
  readonly cursor: UserCursor;

  @IsInt({ message: 'limit은 정수만 가능합니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
