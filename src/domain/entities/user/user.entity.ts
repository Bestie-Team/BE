import { UserPrototype } from 'src/domain/types/user.types';
import { Provider } from 'src/shared/types';

export class UserEntity {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly accountId: string;
  readonly provider: Provider;
  readonly profileImageUrl: string | null;
  readonly termsOfServiceConsent: boolean;
  readonly privacyPolicyConsent: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    input: UserPrototype & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ) {
    return Object.assign(this, input);
  }

  static create(
    input: UserPrototype,
    idGen: () => string,
    stdDate: Date,
    updatedAt?: Date,
  ): UserEntity {
    return new UserEntity({
      id: idGen(),
      createdAt: stdDate,
      updatedAt: updatedAt || stdDate,
      ...input,
    });
  }
}
