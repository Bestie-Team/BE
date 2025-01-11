import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import {
  GROUP_GATHERING_REQUIRED_GROUPID_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  MINIMUM_FRIENDS_REQUIRED_MESSAGE,
} from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { GatheringPrototype } from 'src/domain/types/gathering.types';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';

@Injectable()
export class GatheringsWriteService {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
  ) {}

  async create(prototype: GatheringPrototype, friendIds: string[] | null) {
    const { type, groupId } = prototype;
    if (type === 'FRIEND') {
      await this.createFriendGathering(prototype, friendIds);
    } else {
      await this.createGroupGathering(prototype, groupId);
    }
  }

  async createFriendGathering(
    prototype: GatheringPrototype,
    friendIds: string[] | null,
  ) {
    if (friendIds === null || friendIds.length === 0) {
      throw new BadRequestException(MINIMUM_FRIENDS_REQUIRED_MESSAGE);
    }
    await this.checkIsFriendAll(prototype.hostUserId, friendIds);
    await this.createTransaction(prototype, friendIds);
  }

  async createGroupGathering(
    prototype: GatheringPrototype,
    groupId: string | null,
  ) {
    if (!groupId) {
      throw new BadRequestException(GROUP_GATHERING_REQUIRED_GROUPID_MESSAGE);
    }
    const friendIds = await this.getGroupMemberIds(groupId);
    await this.createTransaction(prototype, friendIds);
  }

  @Transactional()
  private async createTransaction(
    prototype: GatheringPrototype,
    friendIds: string[],
  ) {
    const gatheringId = await this.createGathering(prototype);
    await this.createParticipations(gatheringId, friendIds);
  }

  private async createGathering(prototype: GatheringPrototype) {
    const stdDate = new Date();
    const gathering = GatheringEntity.create(prototype, v4, stdDate);
    await this.gatheringsRepository.save(gathering);

    return gathering.id;
  }

  private async createParticipations(gatheringId: string, friendIds: string[]) {
    const stdDate = new Date();
    const gatheringParticipations = friendIds.map(async (friendId) => {
      const participation = GatheringParticipationEntity.create(
        {
          gatheringId,
          participantId: friendId,
        },
        v4,
        stdDate,
      );
      await this.gatheringParticipationsRepository.save(participation);
    });

    await Promise.all(gatheringParticipations);
  }

  private async checkIsFriendAll(userId: string, friendIds: string[]) {
    const friendChecks = friendIds.map(async (friendId) => {
      const friend = await this.friendsRepository.findOneBySenderAndReceiverId(
        friendId,
        userId,
      );
      if (!friend) {
        throw new BadRequestException(IS_NOT_FRIEND_RELATION_MESSAGE);
      }
    });

    await Promise.all(friendChecks);
  }

  private async getGroupMemberIds(groupId: string) {
    const members = await this.groupsRepository.findGroupMembersById(groupId);
    return members.map((member) => member.participantId);
  }

  async accept(invitationId: string, userId: string) {
    await this.gatheringParticipationsRepository.updateStatus(
      invitationId,
      'ACCEPTED',
    );
  }

  async reject(invitationId: string, userId: string) {
    await this.gatheringParticipationsRepository.updateStatus(
      invitationId,
      'REJECTED',
    );
  }
}
