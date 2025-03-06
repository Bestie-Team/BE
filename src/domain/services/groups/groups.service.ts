import { Transactional } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';
import { GroupParticipationsReader } from 'src/domain/components/group/group-participations-reader';
import { GroupParticipationsWriter } from 'src/domain/components/group/group-participations-writer';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GroupsWriter } from 'src/domain/components/group/groups-writer';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import {
  CANT_INVITE_REPORTED_USER,
  GROUP_MEMBER_ALREADY_EXIST_MESSAGE,
  GROUP_OWNER_CANT_LEAVE_MESSAGE,
} from 'src/domain/error/messages';
import { GroupPrototype } from 'src/domain/types/group.types';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsWriter: GroupsWriter,
    private readonly groupsReader: GroupsReader,
    private readonly groupParticipationsWriter: GroupParticipationsWriter,
    private readonly groupParticipationsReader: GroupParticipationsReader,
    private readonly friendsChecker: FriendsChecker,
  ) {}

  async create(prototype: GroupPrototype, friendUserIds: string[]) {
    await this.friendsChecker.checkIsFriendAll(
      prototype.ownerId,
      friendUserIds,
    );
    const stdDate = new Date();
    const group = GroupEntity.create(prototype, v4, new Date());
    const groupParticipations = [prototype.ownerId, ...friendUserIds].map(
      (participantId) =>
        GroupParticipationEntity.create(
          { groupId: group.id, participantId },
          v4,
          stdDate,
        ),
    );

    await this.createTransaction(group, groupParticipations);
  }

  @Transactional()
  async createTransaction(
    group: GroupEntity,
    participations: GroupParticipationEntity[],
  ) {
    await this.groupsWriter.create(group);
    await this.groupParticipationsWriter.createMany(participations);
  }

  // TODO 최대 인원 체크
  async addMembers(
    groupId: string,
    inviterId: string,
    participantIds: string[],
  ) {
    await this.friendsChecker.checkIsFriendAll(inviterId, participantIds);
    await this.checkExisting(participantIds);
    const stdDate = new Date();
    const groupParticipations = participantIds.map((participantId) =>
      GroupParticipationEntity.create({ groupId, participantId }, v4, stdDate),
    );

    await this.groupParticipationsWriter.createMany(groupParticipations);
  }

  private async checkExisting(userIds: string[]) {
    const participations = await this.groupParticipationsReader.readMulti(
      userIds,
    );
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
    const isOwner = await this.groupsReader.readOne(groupId, userId);
    if (isOwner) {
      throw new BadRequestException(GROUP_OWNER_CANT_LEAVE_MESSAGE);
    }
    await this.groupParticipationsWriter.delete(groupId, userId);
  }

  async update(
    id: string,
    ownerId: string,
    input: Pick<GroupEntity, 'name' | 'description' | 'groupImageUrl'>,
  ) {
    const isOwner = await this.groupsReader.readOne(id, ownerId);
    if (!isOwner) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
    await this.groupsWriter.update(id, {
      ...input,
      updatedAt: new Date(),
    });
  }

  async delete(groupId: string, userId: string) {
    const isOwner = await this.groupsReader.readOne(groupId, userId);
    if (!isOwner) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    await this.groupsWriter.delete(groupId);
  }
}
