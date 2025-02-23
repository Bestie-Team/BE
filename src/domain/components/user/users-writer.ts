import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersReader } from 'src/domain/components/user/users-reader';
import {
  ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE,
  DUPLICATE_ACCOUNT_ID_MESSAGE,
} from 'src/domain/error/messages';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { calcDiff, convertUnixToDate } from 'src/utils/date';

@Injectable()
export class UsersWriter {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly usersReader: UsersReader,
  ) {}

  async updateProfileImage(userId: string, profileImageUrl: string) {
    await this.usersRepository.update({ id: userId, profileImageUrl });
  }

  async updateAccountId(
    userId: string,
    accountId: string,
    today: Date = new Date(),
  ) {
    await this.checkAccountIdChangeCooldown(userId, today);
    await this.checkDuplicateAccountId(accountId);

    await this.usersRepository.update({ id: userId, accountId });
  }

  async updateNotificationToken(token: string, userId: string) {
    await this.usersRepository.update({ id: userId, notificationToken: token });
  }

  async checkDuplicateAccountId(accountId: string) {
    const userByAccountId = await this.usersRepository.findOneByAccountId(
      accountId,
    );
    if (userByAccountId) {
      throw new ConflictException(DUPLICATE_ACCOUNT_ID_MESSAGE);
    }
  }

  private async checkAccountIdChangeCooldown(userId: string, today: Date) {
    const { createdAt, updatedAt } = await this.usersReader.readOne(userId);

    if (
      createdAt.getTime() !== updatedAt.getTime() &&
      convertUnixToDate(calcDiff(today, updatedAt)) < 30
    ) {
      throw new UnprocessableEntityException(
        ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE,
      );
    }
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
  }
}
