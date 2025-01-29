import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import {
  FORBIDDEN_MESSAGE,
  GROUP_GATHERING_REQUIRED_GROUPID_MESSAGE,
  MINIMUM_FRIENDS_REQUIRED_MESSAGE,
} from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { GatheringPrototype } from 'src/domain/types/gathering.types';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { checkIsFriendAll } from 'src/domain/helpers/check-is-friend';

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
    type === 'FRIEND'
      ? await this.createFriendGathering(prototype, friendIds)
      : await this.createGroupGathering(prototype, groupId);
  }

  async createFriendGathering(
    prototype: GatheringPrototype,
    friendIds: string[] | null,
  ) {
    if (friendIds === null || friendIds.length === 0) {
      throw new BadRequestException(MINIMUM_FRIENDS_REQUIRED_MESSAGE);
    }
    await checkIsFriendAll(
      this.friendsRepository,
      prototype.hostUserId,
      friendIds,
    );
    await this.createTransaction(prototype, friendIds);
  }

  async createGroupGathering(
    prototype: GatheringPrototype,
    groupId: string | null,
  ) {
    const { hostUserId } = prototype;
    if (!groupId) {
      throw new BadRequestException(GROUP_GATHERING_REQUIRED_GROUPID_MESSAGE);
    }
    const friendIds = await this.getGroupMemberIds(groupId);
    const filteredIds = friendIds.filter((userId) => userId !== hostUserId);
    await this.createTransaction(prototype, filteredIds);
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

  private async getGroupMemberIds(groupId: string) {
    const members = await this.groupsRepository.findGroupMembersById(groupId);
    return members.map((member) => member.participantId);
  }

  async accept(invitationId: string, userId: string) {
    await this.checkIsParticipant(invitationId, userId);
    await this.gatheringParticipationsRepository.updateStatus(
      invitationId,
      'ACCEPTED',
    );
  }

  async reject(invitationId: string, userId: string) {
    await this.checkIsParticipant(invitationId, userId);
    await this.gatheringParticipationsRepository.delete(invitationId);
  }

  private async checkIsParticipant(invitationId: string, userId: string) {
    const participation =
      await this.gatheringParticipationsRepository.findOneByIdAndParticipantId(
        invitationId,
        userId,
      );
    if (!participation) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
  }
}
