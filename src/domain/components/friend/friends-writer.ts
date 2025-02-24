import { Inject, Injectable } from '@nestjs/common';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

@Injectable()
export class FriendsWriter {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async create(friend: FriendEntity) {
    await this.friendsRepository.save(friend);
  }

  async update(
    senderId: string,
    receiverId: string,
    data: Partial<FriendEntity>,
  ) {
    await this.friendsRepository.update(senderId, receiverId, data);
  }

  async updateById(id: string, data: Partial<FriendEntity>) {
    await this.friendsRepository.updateById(id, data);
  }

  async delete(friendUserId: string, userId: string) {
    await this.friendsRepository.deleteByUserIds(friendUserId, userId);
  }
}
