import { UserPrototype } from 'src/domain/types/user.types';
import { Provider } from 'src/shared/types';

export class UserEntity {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly accountId: string,
    readonly provider: Provider,
    readonly profileImageUrl: string | null,
    readonly termsOfServiceConsent: boolean,
    readonly privacyPolicyConsent: boolean,
    readonly notificationToken: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
    readonly serviceNotificationConsent: boolean = false,
    readonly marketingNotificationConsent: boolean = false,
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
      input.profileImageUrl ?? null,
      input.termsOfServiceConsent,
      input.privacyPolicyConsent,
      null,
      stdDate,
      updatedAt ?? stdDate,
      null,
    );
  }
}
