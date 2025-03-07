import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Length, ValidateNested } from 'class-validator';

class UserCursor {
  @ApiProperty()
  @Length(1, 20)
  readonly name: string;

  @ApiProperty()
  @Length(1, 15)
  readonly accountId: string;
}

export class UserPaginationRequest {
  @ApiProperty({
    type: UserCursor,
    description: `첫 번째 요청 커서: { name: '가', accountId: 'a' }`,
  })
  @ValidateNested({ message: 'invalid cursor' })
  @IsNotEmpty()
  @Type(() => UserCursor)
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value);
      return plainToInstance(UserCursor, json);
    } catch {
      throw new Error(`${value} invalid cursor.`);
    }
  })
  readonly cursor: UserCursor;

  @ApiProperty()
  @IsInt({ message: 'limit은 정수만 가능합니다.' })
  readonly limit: number;
}
