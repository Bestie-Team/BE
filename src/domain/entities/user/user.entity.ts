import { UserPrototype } from 'src/domain/types/user.types';
import { Provider } from 'src/shared/types';

export class UserEntity {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly accountId: string,
    readonly provider: Provider,
    readonly profileImageUrl: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    input: UserPrototype,
    idGen: () => string,
    stdDate: Date,
    updatedAt?: Date,
  ): UserEntity {
    return new UserEntity(
      idGen(),
      input.email,
      input.name,
      input.accountId,
      input.provider,
      input.profileImageUrl,
      stdDate,
      updatedAt ? updatedAt : stdDate,
    );
  }
}
