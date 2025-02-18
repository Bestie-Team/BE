import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { sql } from 'kysely';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import {
  ReceivedGatheringInvitation,
  SentGatheringInvitation,
} from 'src/domain/types/gathering.types';
import {
  GatheringParticipationStatus as SharedGatheringParticipationStatus,
  PaginatedDateRangeInput,
} from 'src/shared/types';

@Injectable()
export class GatheringParticipationsPrismaRepository
  implements GatheringParticipationsRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: GatheringParticipationEntity): Promise<void> {
    await this.txHost.tx.gatheringParticipation.create({
      data,
    });
  }

  async saveMany(data: GatheringParticipationEntity[]): Promise<void> {
    await this.txHost.tx.gatheringParticipation.createMany({ data });
  }

  async findOneByIdAndParticipantId(
    id: string,
    participantId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.gatheringParticipation.findFirst({
      where: {
        id,
        participantId,
      },
    });
  }

  async findReceivedByParticipantId(
    participantId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<ReceivedGatheringInvitation[]> {
    const { cursor, limit, minDate, maxDate } = paginatedDateRangeInput;
    const participationRows = await this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('gathering as g', 'gp.gathering_id', 'g.id')
      .innerJoin('user as hu', 'g.host_user_id', 'hu.id')
      .leftJoin('group as gr', 'g.group_id', 'gr.id')
      .select([
        'gp.id',
        'g.id as gathering_id',
        'g.name',
        'g.description',
        'gp.created_at',
        'g.gathering_date',
        'g.address',
        'g.invitation_image_url',
        'hu.account_id as sender',
        'gr.name as group_name',
      ])
      .where('gp.participant_id', '=', participantId)
      .where('gp.created_at', '>=', new Date(minDate))
      .where('gp.created_at', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb(
            'gp.created_at',
            maxDate === cursor.createdAt ? '<=' : '<',
            new Date(cursor.createdAt),
          ),
          eb.and([
            eb('gp.created_at', '=', new Date(cursor.createdAt)),
            eb('g.id', '>', cursor.id),
          ]),
        ]),
      )
      .where(
        'gp.status',
        '=',
        sql<GatheringParticipationStatus>`${GatheringParticipationStatus.PENDING}::"GatheringParticipationStatus"`,
      )
      .orderBy('gp.created_at', 'desc')
      .orderBy('gp.id', 'asc')
      .limit(limit)
      .execute();

    const result: { [key: string]: ReceivedGatheringInvitation } = {};

    participationRows.forEach((row) => {
      result[row.gathering_id] = {
        id: row.id,
        gatheringId: row.gathering_id,
        address: row.address,
        createdAt: row.created_at,
        description: row.description,
        gatheringDate: row.gathering_date,
        invitation_image_url: row.invitation_image_url,
        groupName: row.group_name,
        name: row.name,
        sender: row.sender,
      };
    });

    return Object.values(result);
  }

  async findSentBySenderId(
    senderId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<SentGatheringInvitation[]> {
    const { cursor, limit, maxDate, minDate } = paginatedDateRangeInput;
    const rows = await this.txHost.tx.$kysely
      .selectFrom('gathering as g')
      .innerJoin('user as hu', 'g.host_user_id', 'hu.id')
      .innerJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
      .leftJoin('group as gr', 'g.group_id', 'gr.id')
      .select([
        'g.id',
        'g.name',
        'g.description',
        'g.created_at',
        'g.gathering_date',
        'g.address',
        'g.invitation_image_url',
        'gr.name as group_name',
        'hu.account_id as sender',
      ])
      .where('g.id', 'in', (qb) =>
        qb
          .selectFrom('gathering as gs')
          .innerJoin(
            'gathering_participation as gps',
            'gs.id',
            'gps.gathering_id',
          )
          .select('gs.id')
          .where('gs.host_user_id', '=', senderId)
          .where('gs.created_at', '>=', new Date(minDate))
          .where('gs.created_at', '<=', new Date(maxDate))
          .where((eb) =>
            eb.or([
              eb(
                'gs.created_at',
                cursor.createdAt === maxDate ? '<=' : '<',
                new Date(cursor.createdAt),
              ),
              eb.and([
                eb('gs.created_at', '=', new Date(cursor.createdAt)),
                eb('gs.id', '>', cursor.id),
              ]),
            ]),
          )
          .where('gs.deleted_at', 'is', null)
          .where(
            'gp.status',
            '=',
            sql<GatheringParticipationStatus>`${GatheringParticipationStatus.PENDING}::"GatheringParticipationStatus"`,
          )
          .orderBy('gs.created_at', 'desc')
          .orderBy('gs.id', 'asc')
          .groupBy('gs.id')
          .limit(limit),
      )
      .orderBy('g.created_at', 'desc')
      .execute();

    const result: { [key: string]: SentGatheringInvitation } = {};
    rows.forEach((row) => {
      if (!result[row.id]) {
        result[row.id] = {
          gatheringId: row.id,
          name: row.name,
          description: row.description,
          address: row.address,
          createdAt: row.created_at,
          groupName: row.group_name,
          gatheringDate: row.gathering_date,
          invitation_image_url: row.invitation_image_url,
          sender: row.sender,
        };
      }
    });

    return Object.values(result);
  }

  async updateStatus(
    invitationId: string,
    status: SharedGatheringParticipationStatus,
  ): Promise<void> {
    await this.txHost.tx.gatheringParticipation.update({
      data: {
        status,
      },
      where: {
        id: invitationId,
      },
    });
  }

  async delete(invitationId: string): Promise<void> {
    await this.txHost.tx.gatheringParticipation.delete({
      where: {
        id: invitationId,
      },
    });
  }

  async deleteAllPendingInvitation(
    firstUserId: string,
    secondUserId: string,
  ): Promise<void> {
    await this.txHost.tx.gatheringParticipation.deleteMany({
      where: {
        OR: [
          {
            participantId: firstUserId,
            gathering: {
              hostUserId: secondUserId,
            },
          },
          {
            participantId: secondUserId,
            gathering: {
              hostUserId: firstUserId,
            },
          },
        ],
        status: GatheringParticipationStatus.PENDING,
      },
    });
  }

  async deleteAllByGatheringId(gatheringId: string): Promise<void> {
    await this.txHost.tx.gatheringParticipation.deleteMany({
      where: {
        gatheringId,
      },
    });
  }
}
