import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { GatheringsWriter } from 'src/domain/components/gathering/gatherings-writer';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringPrototype } from 'src/domain/types/gathering.types';

@Injectable()
export class GatheringsService {
  constructor(
    private readonly gatheringsWriter: GatheringsWriter,
    private readonly gatheringsParticipationsWriter: GatheringInvitationsWriter,
    private readonly groupsReader: GroupsReader,
  ) {}

  async create(input: GatheringPrototype, friendUserIds: string[] | null) {
    const { groupId, hostUserId } = input;
    this.validate(groupId, friendUserIds);

    let inviteeIds: string[] = [];

    if (groupId) {
      inviteeIds = await this.groupsReader.readParticipants(groupId);
    }
    if (friendUserIds) {
      inviteeIds = [...friendUserIds, hostUserId];
      await this.gatheringsWriter.checkIsFriend(hostUserId, friendUserIds);
    }

    const stdDate = new Date();
    const gathering = GatheringEntity.create(input, v4, stdDate);
    const participations = GatheringParticipationEntity.createBulk(
      {
        gatheringId: gathering.id,
        participantIds: inviteeIds,
      },
      v4,
      stdDate,
    );

    await this.createTransaction(gathering, participations);
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

  private validate(groupId: string | null, friendUserIds: string[] | null) {
    if (!groupId && !friendUserIds) {
      throw new BadRequestException(
        '그룹 번호 또는 친구 번호는 필수로 제공되어야 합니다.',
      );
    }
    if (groupId && friendUserIds) {
      throw new BadRequestException(
        '그룹 번호와 친구 번호는 동시에 제공될 수 없습니다.',
      );
    }
  }
}
