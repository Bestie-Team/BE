import { Provider } from '../../../shared/types';
import { UserPrototype } from '../../types/user.types';

export class UserEntity {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly accountId: string,
    readonly provider: Provider,
    readonly profileImageUrl: string,
    readonly createdAt: Date,
  ) {}

  static create(
    input: UserPrototype,
    idGen: () => string,
    stdDate: Date,
  ): UserEntity {
    return new UserEntity(
      idGen(),
      input.email,
      input.name,
      input.accountId,
      input.provider,
      input.profileImageUrl,
      stdDate,
    );
  }
}
