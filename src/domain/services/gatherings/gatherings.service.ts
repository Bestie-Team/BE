import { Transactional } from '@nestjs-cls/transactional';
import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { GatheringsWriter } from 'src/domain/components/gathering/gatherings-writer';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import {
  GatheringPrototype,
  UpdateInput,
} from 'src/domain/types/gathering.types';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { GroupParticipationsReader } from 'src/domain/components/group/group-participations-reader';
import {
  CANT_DELETE_END_GATHERING,
  FORBIDDEN_MESSAGE,
} from 'src/domain/error/messages';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GatheringType } from 'src/shared/types';
import { GatheringsReader } from 'src/domain/components/gathering/gatherings-reader';
import {
  BadRequestException,
  GroupOrFriendRequiredException,
} from 'src/domain/error/exceptions/bad-request.exception';
import { GatheringCreationPastDateException } from 'src/domain/error/exceptions/unprocessable.exception';

@Injectable()
export class GatheringsService {
  constructor(
    private readonly groupsReader: GroupsReader,
    private readonly groupParticipationsReader: GroupParticipationsReader,
    private readonly gatheringsReader: GatheringsReader,
    private readonly gatheringsWriter: GatheringsWriter,
    private readonly gatheringsParticipationsWriter: GatheringInvitationsWriter,
    private readonly notificationsManager: NotificationsManager,
  ) {}

  async create(input: GatheringPrototype, friendUserIds: string[] | null) {
    const { groupId, hostUserId, gatheringDate, type } = input;
    this.validate(type, groupId, friendUserIds, gatheringDate);

    const inviteeIds: string[] = [];

    if (type === 'GROUP' && groupId) {
      await this.setGroupInvitees(inviteeIds, groupId);
    }
    if (type === 'FRIEND' && friendUserIds) {
      await this.setFriendInvitees(inviteeIds, friendUserIds, hostUserId);
    }

    const { gathering, participations } = this.createEntities(
      input,
      inviteeIds,
    );

    await this.createTransaction(gathering, participations);
    this.notificationsManager.sendGatheringCreation(hostUserId, inviteeIds);
  }

  private createEntities(input: GatheringPrototype, inviteeIds: string[]) {
    const stdDate = new Date();
    const gathering = GatheringEntity.create(input, v4, stdDate);
    const participations = GatheringParticipationEntity.createBulk(
      {
        gatheringId: gathering.id,
        participantIds: inviteeIds,
        status: inviteeIds.map((inviteeId) =>
          inviteeId === input.hostUserId ? 'ACCEPTED' : 'PENDING',
        ),
      },
      v4,
      stdDate,
    );

    return {
      gathering,
      participations,
    };
  }

  private async setGroupInvitees(inviteeIds: string[], groupId: string) {
    await this.groupsReader.readOneById(groupId);
    const members = await this.groupParticipationsReader.readParticipants(
      groupId,
    );
    inviteeIds.push(...members);
  }

  private async setFriendInvitees(
    inviteeIds: string[],
    friendUserIds: string[],
    hostUserId: string,
  ) {
    await this.gatheringsWriter.checkIsFriend(hostUserId, friendUserIds);
    inviteeIds.push(...friendUserIds, hostUserId);
  }

  @Transactional()
  private async createTransaction(
    gathering: GatheringEntity,
    gatheringParticipations: GatheringParticipationEntity[],
  ) {
    await this.gatheringsWriter.create(gathering);
    await this.gatheringsParticipationsWriter.createMany(
      gatheringParticipations,
    );
  }

  async update(id: string, hostUserId: string, input: UpdateInput) {
    const gathering = await this.gatheringsReader.readOne(id);
    this.validateGatheringDate(input.gatheringDate);

    if (gathering.hostUserId !== hostUserId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    await this.gatheringsWriter.update(id, input);
  }

  async delete(id: string, userId: string) {
    const gathering = await this.gatheringsReader.readOneByIdAndHostId(
      id,
      userId,
    );

    if (gathering.endedAt) {
      throw new UnprocessableEntityException(CANT_DELETE_END_GATHERING);
    }

    await this.deleteTransaction(id);
  }

  @Transactional()
  private async deleteTransaction(gatheringId: string) {
    await this.gatheringsWriter.delete(gatheringId);
    await this.gatheringsParticipationsWriter.deleteMany(gatheringId);
  }

  // TODO 나중에 분리
  private validate(
    type: GatheringType,
    groupId: string | null,
    friendUserIds: string[] | null,
    gatheringDate: string,
  ) {
    if (!groupId && !friendUserIds) {
      throw new GroupOrFriendRequiredException();
    }
    if (type === 'GROUP' && !groupId) {
      throw new BadRequestException('그룹 모임에 그룹 번호는 필수입니다.');
    }
    if (type === 'FRIEND' && !friendUserIds) {
      throw new BadRequestException('친구 모임에 친구 번호는 필수입니다.');
    }
    if (groupId && friendUserIds) {
      throw new BadRequestException(
        '그룹 번호와 친구 번호는 동시에 제공될 수 없습니다.',
      );
    }
    this.validateGatheringDate(gatheringDate);
  }

  private validateGatheringDate(gatheringDate: string) {
    if (Date.now() > new Date(gatheringDate).getTime()) {
      throw new GatheringCreationPastDateException();
    }
  }
}
