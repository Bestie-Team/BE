import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOT_FOUND_USER_MESSAGE } from 'src/domain/error/messages';
import { getUserCursor } from 'src/domain/helpers/get-cursor';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { SearchInput } from 'src/domain/types/user.types';

@Injectable()
export class UsersReader {
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

  async readDetail(id: string) {
    const user = await this.usersRepository.findDetailById(id);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  async readProfile(id: string) {
    const user = await this.usersRepository.findProfileById(id);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  async readOne(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  async readOneByEmail(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE);
    }

    return user;
  }

  /**
   * 검색 결과가 없는 경우 null을 반환함.
   */
  async readOneByAccountId(accountId: string): Promise<{ id: string } | null> {
    return await this.usersRepository.findOneByAccountId(accountId);
  }

  async readMulti(userIds: string[]) {
    return this.usersRepository.findUsersByIds(userIds);
  }
}
