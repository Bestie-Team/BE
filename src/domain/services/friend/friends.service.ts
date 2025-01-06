import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import {
  FORBIDDEN_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
} from 'src/domain/error/messages';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { UserPaginationInput } from 'src/shared/types';
import { User } from 'src/domain/types/user.types';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async getAllFriendByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ) {
    const users = await this.friendsRepository.findAllFriendByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = this.getCursor(users, paginationInput.limit);

    return {
      users,
      nextCursor,
    };
  }

  async request(prototype: FriendPrototype) {
    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);

    await this.friendsRepository.save(friend);
  }

  async accept(friendId: string, receiverId: string) {
    await this.checkReceiver(friendId, receiverId);
    await this.friendsRepository.update(friendId, {
      status: 'ACCEPTED',
      updatedAt: new Date(),
    });
  }

  async reject(friendId: string, receiverId: string) {
    await this.checkReceiver(friendId, receiverId);
    await this.friendsRepository.delete(friendId);
  }

  async checkReceiver(friendId: string, receiverId: string) {
    const friendRequest = await this.friendsRepository.findOneById(friendId);
    if (!friendRequest) {
      throw new NotFoundException(NOT_FOUND_FRIEND_MESSAGE);
    }

    if (friendRequest.receiverId !== receiverId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
  }

  getCursor(users: User[], limit: number): string | null {
    return users[limit - 1]?.name || null;
  }
}
