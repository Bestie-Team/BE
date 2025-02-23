import { Transactional } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';
import { v4 } from 'uuid';
import {
  CANT_REQUEST_REPORTED_FRIEND_MESSAGE,
  FRIEND_ALREADY_EXIST_MESSAGE,
  FRIEND_REQUEST_ALREADY_EXIST_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
} from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

@Injectable()
export class FriendsWriter {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  async request(prototype: FriendPrototype) {
    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);

    await this.friendsRepository.save(friend);
  }

  async checkExistFriend(senderId: string, receiverId: string) {
    const existFriend =
      await this.friendsRepository.findOneBySenderAndReceiverId(
        senderId,
        receiverId,
      );
    if (existFriend) {
      if (existFriend.status === 'ACCEPTED') {
        throw new ConflictException(FRIEND_ALREADY_EXIST_MESSAGE);
      }
      if (existFriend.status === 'PENDING') {
        throw new ConflictException(FRIEND_REQUEST_ALREADY_EXIST_MESSAGE);
      }
      // TODO 요구사항 변경에 따라 수정 가능성 있음.
      if (existFriend.status === 'REPORTED') {
        throw new BadRequestException(CANT_REQUEST_REPORTED_FRIEND_MESSAGE);
      }
    }
  }

  async accept(senderId: string, receiverId: string) {
    const friendRequest = await this.checkExistRequest(senderId, receiverId);
    if (friendRequest.receiverId !== receiverId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    await this.friendsRepository.update(friendRequest.id, {
      status: 'ACCEPTED',
      updatedAt: new Date(),
    });
  }

  async reject(senderId: string, receiverId: string) {
    const friendRequest = await this.checkExistRequest(senderId, receiverId);
    await this.friendsRepository.delete(friendRequest.id);
  }

  async checkExistRequest(senderId: string, receiverId: string) {
    const friendRequest =
      await this.friendsRepository.findOneBySenderAndReceiverId(
        senderId,
        receiverId,
      );
    if (!friendRequest) {
      throw new NotFoundException(NOT_FOUND_FRIEND_MESSAGE);
    }

    return friendRequest;
  }

  async delete(friendUserId: string, userId: string) {
    await this.checkExistAcceptedFriend(friendUserId, userId);
    await this.deleteTransaction(friendUserId, userId);
  }

  @Transactional()
  async deleteTransaction(friendUserId: string, userId: string) {
    await this.deleteAllPendingGatheringInvitation(friendUserId, userId);
    await this.friendsRepository.deleteByUserIds(friendUserId, userId);
  }

  private async checkExistAcceptedFriend(friendUserId: string, userId: string) {
    const friend = await this.friendsRepository.findOneBySenderAndReceiverId(
      friendUserId,
      userId,
    );
    if (!friend || friend.status !== 'ACCEPTED') {
      throw new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }
  }

  private async deleteAllPendingGatheringInvitation(
    firstUserId: string,
    secondUserId: string,
  ) {
    return await this.gatheringParticipationsRepository.deleteAllPendingInvitation(
      firstUserId,
      secondUserId,
    );
  }
}
