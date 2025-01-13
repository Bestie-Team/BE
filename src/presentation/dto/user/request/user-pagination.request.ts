import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, Length, ValidateNested } from 'class-validator';

class UserCursor {
  @ApiProperty()
  @Length(1, 20, { message: '이름 커서는 1자 이상 20자 이하입니다.' })
  readonly name: string;

  @ApiProperty()
  @Length(1, 15, { message: '계정 아이디 커서는 1자 이상 15자 이하입니다.' })
  readonly accountId: string;
}

export class UserPaginationRequest {
  @ApiProperty({
    type: UserCursor,
    description: `첫 번째 요청 cursor: ${JSON.stringify(
      { name: '가', accountId: 'a' },
      null,
      2,
    )}`,
  })
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => UserCursor)
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value);
      return plainToInstance(UserCursor, json);
    } catch {
      throw new Error(`${value}는 올바른 커서가 아닙니다.`);
    }
  })
  readonly cursor: UserCursor;

  @ApiProperty()
  @IsInt({ message: 'limit은 정수만 가능합니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
