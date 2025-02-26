import { Transactional } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
  CONFLICT_GROUP_AND_FRIEND_MESSAGE,
  GATHERING_CREATION_PAST_DATE_MESSAGE,
  REQUIRED_GROUP_OR_FRIEND_MESSAGE,
} from 'src/domain/error/messages';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GatheringType } from 'src/shared/types';
import { GatheringsReader } from 'src/domain/components/gathering/gatherings-reader';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';

@Injectable()
export class GatheringsService {
  constructor(
    private readonly groupsReader: GroupsReader,
    private readonly groupParticipationsReader: GroupParticipationsReader,
    private readonly gatheringsWriter: GatheringsWriter,
    private readonly gatheringsReader: GatheringsReader,
    private readonly gatheringsParticipationsWriter: GatheringInvitationsWriter,
    private readonly notificationsManager: NotificationsManager,
  ) {}

  async create(input: GatheringPrototype, friendUserIds: string[] | null) {
    const { groupId, hostUserId, gatheringDate, type } = input;
    this.validate(type, groupId, friendUserIds, gatheringDate);

    let inviteeIds: string[] = [];

    if (type === 'GROUP' && groupId) {
      await this.groupsReader.readOneById(groupId);
      inviteeIds = await this.groupParticipationsReader.readParticipants(
        groupId,
      );
    }
    if (type === 'FRIEND' && friendUserIds) {
      inviteeIds = [...friendUserIds, hostUserId];
      await this.gatheringsWriter.checkIsFriend(hostUserId, friendUserIds);
    }

    const stdDate = new Date();
    const gathering = GatheringEntity.create(input, v4, stdDate);
    const participations = GatheringParticipationEntity.createBulk(
      {
        gatheringId: gathering.id,
        participantIds: inviteeIds,
        status: inviteeIds.map((inviteeId) =>
          inviteeId === hostUserId ? 'ACCEPTED' : 'PENDING',
        ),
      },
      v4,
      stdDate,
    );

    await this.createTransaction(gathering, participations);
    this.notificationsManager.sendGatheringCreation(hostUserId, inviteeIds);
  }

  @Transactional()
  async createTransaction(
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

  // TODO 나중에 Checker로 분리도 가능.
  private validate(
    type: GatheringType,
    groupId: string | null,
    friendUserIds: string[] | null,
    gatheringDate: string,
  ) {
    if (!groupId && !friendUserIds) {
      throw new BadRequestException(REQUIRED_GROUP_OR_FRIEND_MESSAGE);
    }
    if (type === 'GROUP') {
      if (!groupId) {
        throw new BadRequestException();
      }
    }
    if (type === 'FRIEND') {
      if (!friendUserIds) {
        throw new BadRequestException();
      }
    }
    if (groupId && friendUserIds) {
      throw new BadRequestException(CONFLICT_GROUP_AND_FRIEND_MESSAGE);
    }
    this.validateGatheringDate(gatheringDate);
  }

  private validateGatheringDate(gatheringDate: string) {
    if (Date.now() > new Date(gatheringDate).getTime()) {
      throw new BadRequestException(GATHERING_CREATION_PAST_DATE_MESSAGE);
    }
  }
}
