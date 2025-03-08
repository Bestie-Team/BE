import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import {
  ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE,
  DUPLICATE_ACCOUNT_ID_MESSAGE,
} from 'src/domain/error/messages';
import { calcDateDiff } from 'src/utils/date';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersReader: UsersReader,
    private readonly usersWriter: UsersWriter,
  ) {}

  async changeProfileImage(userId: string, profileImageUrl: string) {
    await this.usersWriter.updateProfileImage(userId, profileImageUrl);
  }

  async changeAccountId(userId: string, accountId: string, today = new Date()) {
    await this.checkAccountIdChangeCooldown(userId, today);
    await this.checkDuplicateAccountId(accountId);

    await this.usersWriter.updateAccountId(userId, accountId);
  }

  private async checkAccountIdChangeCooldown(userId: string, today: Date) {
    const { createdAt, updatedAt } = await this.usersReader.readOne(userId);

    const isSetFirst = createdAt.getTime() === updatedAt.getTime();
    const daysRemaining = calcDateDiff(today, updatedAt, 'd');
    if (!isSetFirst && daysRemaining < 30) {
      throw new UnprocessableEntityException(
        ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE(30 - daysRemaining),
      );
    }
  }

  async checkDuplicateAccountId(accountId: string) {
    const userByAccountId = await this.usersReader.readOneByAccountId(
      accountId,
    );
    if (userByAccountId) {
      throw new ConflictException(DUPLICATE_ACCOUNT_ID_MESSAGE);
    }
  }
}
