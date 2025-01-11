import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { getUserCursor } from 'src/domain/shared/get-cursor';
import { SearchInput } from 'src/domain/types/user.types';

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
}
