import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { GroupPrototype } from 'src/domain/types/group.types';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import {
  CANT_INVITE_REPORTED_USER,
  FORBIDDEN_MESSAGE,
  GROUP_MEMBER_ALREADY_EXIST_MESSAGE,
  GROUP_OWNER_CANT_LEAVE_MESSAGE,
} from 'src/domain/error/messages';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { checkIsFriendAll } from 'src/domain/helpers/check-is-friend';

@Injectable()
export class GroupsWriteService {
  constructor(
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
  ) {}

  async create(prototype: GroupPrototype, friendIds: string[]) {
    await checkIsFriendAll(
      this.friendsRepository,
      prototype.ownerId,
      friendIds,
    );
    const stdDate = new Date();
    const group = GroupEntity.create(prototype, v4, new Date());
    const groupParticipations = [prototype.ownerId, ...friendIds].map(
      (participantId) =>
        GroupParticipationEntity.create(
          { groupId: group.id, participantId },
          v4,
          stdDate,
        ),
    );

    await this.createTransaction(group, groupParticipations);
  }

  async addNewMembers(
    groupId: string,
    inviterId: string,
    participantIds: string[],
  ) {
    await checkIsFriendAll(this.friendsRepository, inviterId, participantIds);
    await this.checkExisting(participantIds);
    const stdDate = new Date();
    const groupParticipations = participantIds.map((participantId) =>
      GroupParticipationEntity.create({ groupId, participantId }, v4, stdDate),
    );

    await this.groupParticipationsRepository.saveMany(groupParticipations);
  }

  private async checkExisting(userIds: string[]) {
    const participations =
      await this.groupParticipationsRepository.findByUserIds(userIds);
    participations.forEach((participation) => {
      if (participation) {
        if (participation.status === 'REPORTED') {
          throw new UnprocessableEntityException(CANT_INVITE_REPORTED_USER);
        }
        if (participation.status === 'ACCEPTED') {
          throw new ConflictException(GROUP_MEMBER_ALREADY_EXIST_MESSAGE);
        }
      }
    });
  }

  async leaveGroup(groupId: string, userId: string) {
    const isOwner = await this.checkIsOwner(groupId, userId);
    if (isOwner) {
      throw new BadRequestException(GROUP_OWNER_CANT_LEAVE_MESSAGE);
    }
    await this.groupParticipationsRepository.delete(groupId, userId);
  }

  async deleteGroup(groupId: string, userId: string) {
    const isOwner = await this.checkIsOwner(groupId, userId);
    if (!isOwner) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    await this.groupsRepository.delete(groupId);
  }

  async update(
    id: string,
    ownerId: string,
    input: Pick<GroupEntity, 'name' | 'description' | 'groupImageUrl'>,
  ) {
    await this.checkIsOwner(id, ownerId);
    await this.groupsRepository.update(id, {
      ...input,
      updatedAt: new Date(),
    });
  }

  @Transactional()
  private async createTransaction(
    group: GroupEntity,
    groupParticipations: GroupParticipationEntity[],
  ) {
    await this.groupsRepository.save(group);
    await this.groupParticipationsRepository.saveMany(groupParticipations);
  }

  private async checkIsOwner(groupId: string, userId: string) {
    const group = await this.groupsRepository.findOneByGroupAndOwnerId(
      groupId,
      userId,
    );

    return group;
  }
}
