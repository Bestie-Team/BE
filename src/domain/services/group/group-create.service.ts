import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { GroupPrototype } from 'src/domain/types/group.types';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { IS_NOT_FRIEND_RELATION_MESSAGE } from 'src/domain/error/messages';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';

@Injectable()
export class GroupCreateService {
  constructor(
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
  ) {}

  async create(prototype: GroupPrototype, friendIds: string[]) {
    await this.checkIsFriendAll(prototype.ownerId, friendIds);
    const stdDate = new Date();
    const group = GroupEntity.create(prototype, v4, stdDate);
    await this.createTransaction(group, friendIds);
  }

  async addNewMember(userId: string, groupId: string, participantId: string) {
    await this.checkIsFriend(userId, participantId);
    await this.addMember(groupId, participantId);
  }

  @Transactional()
  private async createTransaction(group: GroupEntity, friendIds: string[]) {
    await this.createGroup(group);
    await this.createGroupParticipations(group.id, friendIds);
  }

  private async checkIsFriendAll(userId: string, friendIds: string[]) {
    const friendChecks = friendIds.map(async (friendId) => {
      await this.checkIsFriend(userId, friendId);
    });

    await Promise.all(friendChecks);
  }

  private async checkIsFriend(userId: string, friendId: string) {
    const friend = await this.friendsRepository.findOneBySenderAndReceiverId(
      friendId,
      userId,
    );
    if (!friend) {
      throw new BadRequestException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }
  }

  private async createGroup(entity: GroupEntity) {
    await this.groupsRepository.save(entity);
  }

  private async createGroupParticipations(
    groupId: string,
    friendIds: string[],
  ) {
    const groupParticipations = friendIds.map(async (friendId) => {
      await this.addMember(groupId, friendId);
    });

    await Promise.all(groupParticipations);
  }

  async addMember(groupId: string, participantId: string) {
    const stdDate = new Date();
    const participation = GroupParticipationEntity.create(
      { groupId, participantId },
      v4,
      stdDate,
    );
    await this.groupParticipationsRepository.save(participation);
  }
}
