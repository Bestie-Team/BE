import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { NOT_FOUND_USER_MESSAGE } from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { v4 } from 'uuid';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async request(prototype: FriendPrototype) {
    await this.getUserByIdOrThrow(prototype.receiverId);
    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);

    await this.friendsRepository.save(friend);
  }

  async getUserByIdOrThrow(userId: string) {
    const exist = await this.usersRepository.findOneById(userId);
    if (!exist) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE(userId));
    }
  }
}
