import { Transactional } from '@nestjs-cls/transactional';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';
import { GroupParticipationsReader } from 'src/domain/components/group/group-participations-reader';
import { GroupParticipationsWriter } from 'src/domain/components/group/group-participations-writer';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GroupsWriter } from 'src/domain/components/group/groups-writer';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupPrototype } from 'src/domain/types/group.types';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';
import { GroupNotFoundException } from 'src/domain/error/exceptions/not-found.exception';
import {
  GroupMemberLimitExceededException,
  GroupOwnerCannotLeaveException,
  ReportedUserCannotInviteException,
} from 'src/domain/error/exceptions/unprocessable.exception';
import { AlreadyExistMemberException } from 'src/domain/error/exceptions/conflice.exception';

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

  // TODO 그룹원 추가할 떄 신고한 애는 조회 안 돼야할듯
  async addMembers(
    groupId: string,
    inviterId: string,
    participantIds: string[],
  ) {
    await this.friendsChecker.checkIsFriendAll(inviterId, participantIds);
    await this.checkExisting(groupId, participantIds);
    await this.checkMemberCount(groupId, participantIds.length);

    const stdDate = new Date();
    const groupParticipations = participantIds.map((participantId) =>
      GroupParticipationEntity.create({ groupId, participantId }, v4, stdDate),
    );

    await this.groupParticipationsWriter.createMany(groupParticipations);
  }

  private async checkMemberCount(groupId: string, newMemberCount: number) {
    const count = await this.groupParticipationsReader.getMemberCount(groupId);
    if (count + newMemberCount > 10) {
      throw new GroupMemberLimitExceededException();
    }
  }

  private async checkExisting(groupId: string, userIds: string[]) {
    const participations = await this.groupParticipationsReader.readMulti(
      groupId,
      userIds,
    );
    participations.forEach((participation) => {
      if (participation) {
        if (participation.status === 'REPORTED') {
          throw new ReportedUserCannotInviteException();
        }
        if (participation.status === 'ACCEPTED') {
          throw new AlreadyExistMemberException();
        }
      }
    });
  }

  async leaveGroup(groupId: string, userId: string) {
    try {
      await this.groupsReader.readOne(groupId, userId);
      throw new GroupOwnerCannotLeaveException();
    } catch (e: unknown) {
      if (e instanceof GroupNotFoundException) {
        return await this.groupParticipationsWriter.delete(groupId, userId);
      }
      throw e;
    }
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
    try {
      await this.groupsReader.readOne(groupId, userId);
      await this.groupsWriter.delete(groupId);
    } catch (e: unknown) {
      if (e instanceof GroupNotFoundException) {
        throw new ForbiddenException(FORBIDDEN_MESSAGE);
      }
    }
  }
}
