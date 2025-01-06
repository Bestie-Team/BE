import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { SearchInput, User } from 'src/domain/types/user.types';

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
    const nextCursor = this.getCursor(searchedUsers, paginationInput.limit);

    return {
      users: searchedUsers,
      nextCursor,
    };
  }

  getCursor(users: User[], limit: number): string | null {
    return users[limit - 1]?.name || null;
  }
}
