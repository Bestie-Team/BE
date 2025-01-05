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
    const searchedUsers = await this.usersRepository.findByAccountIdContaining(
      userId,
      searchInput,
    );
    const nextCursor = this.getCursor(searchedUsers);

    return {
      users: searchedUsers,
      nextCursor,
    };
  }

  getCursor(users: User[]) {
    return users.at(-1)?.name || null;
  }
}
