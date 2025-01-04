import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async request(prototype: FriendPrototype) {
    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);

    await this.friendsRepository.save(friend);
  }

  async accept(friendId: string, receiverId: string) {
    await this.checkReceiver(friendId, receiverId);

    const stdDate = new Date();
    await this.friendsRepository.update(friendId, {
      status: 'ACCEPTED',
      updatedAt: stdDate,
    });
  }

  async reject(friendId: string, receiverId: string) {
    await this.checkReceiver(friendId, receiverId);
    await this.friendsRepository.delete(friendId);
  }

  async checkReceiver(friendId: string, receiverId: string) {
    const friendRequest = await this.friendsRepository.findOneById(friendId);
    if (!friendRequest) {
      throw new NotFoundException();
    }

    if (friendRequest.receiverId !== receiverId) {
      throw new ForbiddenException();
    }
  }
}
