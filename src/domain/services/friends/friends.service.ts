import { Transactional } from '@nestjs-cls/transactional';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { NOT_FOUND_FRIEND_MESSAGE } from 'src/domain/error/messages';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendsReader: FriendsReader,
    private readonly friendsWriter: FriendsWriter,
    private readonly gatheringParticipationWriter: GatheringInvitationsWriter,
  ) {}

  async request(prototype: FriendPrototype) {
    const { senderId, receiverId } = prototype;
    await this.friendsWriter.checkExistFriend(senderId, receiverId);

    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);
    await this.friendsWriter.create(friend);
  }

  async accept(senderId: string, receiverId: string) {
    const friendRequest = await this.friendsReader.readOne(
      senderId,
      receiverId,
    );
    if (!friendRequest) {
      throw new NotFoundException(NOT_FOUND_FRIEND_MESSAGE);
    }
    if (friendRequest.receiverId !== receiverId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    await this.friendsWriter.updateById(friendRequest.id, {
      status: 'ACCEPTED',
      updatedAt: new Date(),
    });
  }

  async delete(friendUserId: string, userId: string) {
    await this.friendsWriter.checkExistAcceptedFriend(friendUserId, userId);
    await this.deleteTransaction(friendUserId, userId);
  }

  @Transactional()
  async deleteTransaction(friendUserId: string, userId: string) {
    await this.friendsWriter.delete(friendUserId, userId);
    await this.gatheringParticipationWriter.deletePending(friendUserId, userId);
  }
}
