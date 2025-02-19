import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE,
  DUPLICATE_ACCOUNT_ID_MESSAGE,
  NOT_FOUND_USER_MESSAGE,
} from 'src/domain/error/messages';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { getUserCursor } from 'src/domain/helpers/get-cursor';
import { SearchInput } from 'src/domain/types/user.types';
import { calcDiff, convertUnixToDate } from 'src/utils/date';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async search(userId: string, searchInput: SearchInput) {
    const { search, paginationInput } = searchInput;
    const searchedUsers = await this.usersRepository.findByAccountIdContaining(
      userId,
      { search, paginationInput },
    );
    const nextCursor = getUserCursor(searchedUsers, paginationInput.limit);

    return {
      users: searchedUsers,
      nextCursor,
    };
  }

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

  async getDetail(id: string) {
    const user = await this.usersRepository.findDetailById(id);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  async getProfile(id: string) {
    const user = await this.usersRepository.findProfileById(id);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  async getUserByIdOrThrow(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  async getUsersByIds(userIds: string[]) {
    return this.usersRepository.findUsersByIds(userIds);
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
    const { createdAt, updatedAt } = await this.getUserByIdOrThrow(userId);

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
