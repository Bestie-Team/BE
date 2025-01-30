import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { sql } from 'kysely';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringInvitation } from 'src/domain/types/gathering.types';
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
  ): Promise<GatheringInvitation[]> {
    const { cursor, limit, minDate, maxDate } = paginatedDateRangeInput;
    const participationRows = await this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('gathering as g', 'gp.gathering_id', 'g.id')
      .leftJoin('group as gr', 'g.group_id', 'gr.id')
      .innerJoin('user as hu', 'g.host_user_id', 'hu.id')
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
            'g.gathering_date',
            minDate === cursor.createdAt ? '<=' : '<',
            new Date(cursor.createdAt),
          ),
          eb.and([
            eb('g.gathering_date', '=', new Date(cursor.createdAt)),
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

    const gatheringIds = participationRows.map((row) => row.gathering_id);
    if (gatheringIds.length === 0) return [];

    const memberRows = await this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('user as mu', 'gp.participant_id', 'mu.id')
      .select([
        'gp.gathering_id',
        'mu.id',
        'mu.account_id',
        'mu.name',
        'mu.profile_image_url',
      ])
      .where('gp.gathering_id', 'in', gatheringIds)
      .where('mu.id', '!=', participantId)
      .execute();
    const result: { [key: string]: GatheringInvitation } = {};

    participationRows.forEach((row) => {
      result[row.gathering_id] = {
        id: row.id,
        address: row.address,
        createdAt: row.created_at,
        description: row.description,
        gatheringDate: row.gathering_date,
        invitation_image_url: row.invitation_image_url,
        groupName: row.group_name,
        name: row.name,
        sender: row.sender,
        members: [],
      };
    });
    memberRows.forEach((member) => {
      result[member.gathering_id].members.push({
        id: member.id,
        accountId: member.account_id,
        name: member.name,
        profileImageUrl: member.profile_image_url,
      });
    });

    return Object.values(result);
  }

  async findSentBySenderId(
    senderId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<GatheringInvitation[]> {
    const { cursor, limit, maxDate, minDate } = paginatedDateRangeInput;
    const rows = await this.txHost.tx.$kysely
      .selectFrom('gathering as g')
      .innerJoin('user as hu', 'g.host_user_id', 'hu.id')
      .innerJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
      .innerJoin('user as mu', 'gp.participant_id', 'mu.id')
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
        'mu.id as member_id',
        'mu.account_id as member_account_id',
        'mu.name as member_name',
        'mu.profile_image_url as member_profile_image_url',
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
                'g.gathering_date',
                minDate === cursor.createdAt ? '<=' : '<',
                new Date(cursor.createdAt),
              ),
              eb.and([
                eb('g.gathering_date', '=', new Date(cursor.createdAt)),
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
          .groupBy('gs.id')
          .limit(limit),
      )
      .orderBy('g.created_at', 'desc')
      .execute();

    const result: { [key: string]: GatheringInvitation } = {};
    rows.forEach((row) => {
      if (!result[row.id]) {
        result[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          address: row.address,
          createdAt: row.created_at,
          groupName: row.group_name,
          gatheringDate: row.gathering_date,
          invitation_image_url: row.invitation_image_url,
          sender: row.sender,
          members: [],
        };
      }

      result[row.id].members.push({
        id: row.member_id,
        accountId: row.member_account_id,
        name: row.member_name,
        profileImageUrl: row.member_profile_image_url,
      });
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
}
