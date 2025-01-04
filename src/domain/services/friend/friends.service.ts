import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { NOT_FOUND_USER_MESSAGE } from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';

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

  async accept(friendId: string) {
    const stdDate = new Date();
    await this.friendsRepository.update(friendId, {
      status: 'ACCEPTED',
      updatedAt: stdDate,
    });
  }

  async reject(friendId: string, receiverId: string) {
    const friendRequest = await this.getFriendByIdOrThrow(friendId);
    if (friendRequest.receiverId !== receiverId) {
      throw new ForbiddenException();
    }
    await this.friendsRepository.delete(friendId);
  }

  async getFriendByIdOrThrow(friendId: string) {
    const friend = await this.friendsRepository.findOneById(friendId);
    if (!friend) {
      throw new NotFoundException();
    }

    return friend;
  }

  async getUserByIdOrThrow(userId: string) {
    const exist = await this.usersRepository.findOneById(userId);
    if (!exist) {
      throw new NotFoundException(NOT_FOUND_USER_MESSAGE(userId));
    }
  }
}
