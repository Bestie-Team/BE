import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { SelectQueryBuilder, sql } from 'kysely';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import {
  EndedGathering,
  Gathering,
  GatheringDetail,
} from 'src/domain/types/gathering.types';
import {
  DateIdPaginationInput,
  PaginatedDateRangeInput,
} from 'src/shared/types';

@Injectable()
export class GatheringsPrismaRepository implements GatheringsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: GatheringEntity): Promise<void> {
    await this.txHost.tx.gathering.create({
      data,
    });
  }

  async findByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<Gathering[]> {
    const { cursor, limit, minDate, maxDate } = paginatedDateRangeInput;
    const subquery = this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('active_gathering as g', 'g.id', 'gp.gathering_id')
      .select(['g.id'])
      .where((eb) =>
        eb.and([
          eb('gp.participant_id', '=', userId),
          eb(
            'gp.status',
            '=',
            sql<GatheringParticipationStatus>`${GatheringParticipationStatus.ACCEPTED}::"GatheringParticipationStatus"`,
          ),
        ]),
      )
      .where('g.gathering_date', '>=', new Date(minDate))
      .where('g.gathering_date', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb(
            'g.gathering_date',
            maxDate === cursor.createdAt ? '<=' : '<',
            new Date(cursor.createdAt),
          ),
          eb.and([
            eb('g.gathering_date', '=', new Date(cursor.createdAt)),
            eb('g.id', '>', cursor.id),
          ]),
        ]),
      )
      .where('g.ended_at', 'is', null)
      .orderBy('g.gathering_date', 'desc')
      .orderBy('g.id', 'asc')
      .groupBy(['g.id', 'g.gathering_date'])
      .limit(limit);
    return await this.findGatherings(subquery);
  }

  async findEndedGatheringsByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<EndedGathering[]> {
    const { cursor, limit, minDate, maxDate } = paginatedDateRangeInput;
    const subquery = this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('active_gathering as g', 'g.id', 'gp.gathering_id')
      .select(['g.id'])
      .where((eb) =>
        eb.and([
          eb('gp.participant_id', '=', userId),
          eb(
            'gp.status',
            '=',
            sql<GatheringParticipationStatus>`${GatheringParticipationStatus.ACCEPTED}::"GatheringParticipationStatus"`,
          ),
        ]),
      )
      .where('g.gathering_date', '>=', new Date(minDate))
      .where('g.gathering_date', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb(
            'g.gathering_date',
            maxDate === cursor.createdAt ? '<=' : '<',
            new Date(cursor.createdAt),
          ),
          eb.and([
            eb('g.gathering_date', '=', new Date(cursor.createdAt)),
            eb('g.id', '>', cursor.id),
          ]),
        ]),
      )
      .where('g.ended_at', 'is not', null)
      .orderBy('g.gathering_date', 'desc')
      .orderBy('g.id', 'asc')
      .groupBy(['g.id', 'g.gathering_date'])
      .limit(limit);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('active_gathering as g')
      .leftJoin('active_feed as f', 'f.gathering_id', 'g.id')
      .select([
        'g.id',
        'g.name',
        'g.gathering_date',
        'g.invitation_image_url',
        'g.description',
        sql<string>`CASE
        WHEN f.writer_id = ${userId} THEN TRUE
        ELSE FALSE
      END`.as('is_feed_posted'),
      ])
      .where('g.id', 'in', () => subquery)
      .orderBy('g.gathering_date', 'desc')
      .orderBy('g.id', 'asc')
      .execute();

    const result: { [key: string]: EndedGathering } = {};
    rows.forEach((row) => {
      if (!result[row.id]) {
        result[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          gatheringDate: row.gathering_date,
          invitationImageUrl: row.invitation_image_url,
          isFeedPosted: Boolean(row.is_feed_posted),
        };
      } else if (row.is_feed_posted) {
        result[row.id].isFeedPosted = true;
      }
    });

    return Object.values(result);
  }

  async findGatheringsWithoutFeedByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Gathering[]> {
    const { cursor, limit } = paginationInput;
    const subquery = this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('active_gathering as g', 'g.id', 'gp.gathering_id')
      .select(['g.id'])
      .where('g.deleted_at', 'is', null)
      .where('g.ended_at', 'is not', null)
      .where('g.id', 'not in', (qb) =>
        qb
          .selectFrom('active_feed as f')
          .select(['gathering_id'])
          .where('f.deleted_at', 'is', null)
          .where('f.gathering_id', 'is not', null)
          .where('f.writer_id', '=', userId),
      )
      .where((eb) =>
        eb.and([
          eb('gp.participant_id', '=', userId),
          eb(
            'gp.status',
            '=',
            sql<GatheringParticipationStatus>`${GatheringParticipationStatus.ACCEPTED}::"GatheringParticipationStatus"`,
          ),
        ]),
      )
      .where((eb) =>
        eb.or([
          eb('g.gathering_date', '<', new Date(cursor.createdAt)),
          eb.and([
            eb('g.gathering_date', '=', new Date(cursor.createdAt)),
            eb('g.id', '>', cursor.id),
          ]),
        ]),
      )
      .orderBy('g.gathering_date', 'desc')
      .orderBy('g.id', 'asc')
      .groupBy(['g.id', 'g.gathering_date'])
      .limit(limit);

    return await this.findGatherings(subquery);
  }

  async findGatherings(
    subquery: SelectQueryBuilder<any, any, any>,
  ): Promise<Gathering[]> {
    const rows = await this.txHost.tx.$kysely
      .selectFrom('active_gathering as g')
      .select([
        'g.id',
        'g.name',
        'g.gathering_date',
        'g.invitation_image_url',
        'g.description',
      ])
      .where('g.id', 'in', () => subquery)
      .orderBy('g.gathering_date', 'desc')
      .orderBy('g.id', 'asc')
      .execute();

    const result: { [key: string]: Gathering } = {};
    rows.forEach((row) => {
      if (!result[row.id]) {
        result[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          gatheringDate: row.gathering_date,
          invitationImageUrl: row.invitation_image_url,
        };
      }
    });

    return Object.values(result);
  }

  // TODO 이렇게 조인 여러변 된 쿼리는 view 못 쓰니까 쿼리빌더로 변경하기
  async findDetailById(id: string): Promise<GatheringDetail | null> {
    const result = await this.txHost.tx.gathering.findUnique({
      select: {
        id: true,
        name: true,
        description: true,
        gatheringDate: true,
        address: true,
        invitationImageUrl: true,
        user: {
          select: {
            id: true,
            accountId: true,
            profileImageUrl: true,
            name: true,
          },
        },
        participations: {
          select: {
            participant: {
              select: {
                id: true,
                accountId: true,
                profileImageUrl: true,
                name: true,
              },
            },
          },
        },
      },
      where: {
        id,
        deletedAt: null,
        user: {
          deletedAt: null,
        },
      },
    });

    return result
      ? {
          id: result.id,
          address: result.address,
          description: result.description,
          gatheringDate: result.gatheringDate,
          invitationImageUrl: result.invitationImageUrl,
          name: result.name,
          hostUser: result.user,
          members: result.participations
            .filter((p) => p.participant.id !== result.user.id)
            .map((participant) => ({
              ...participant.participant,
            })),
        }
      : null;
  }

  async findOneByIdAndHostId(
    id: string,
    hostId: string,
  ): Promise<{ id: string; endedAt: Date | null } | null> {
    return await this.txHost.tx.activeGathering.findFirst({
      select: { id: true, endedAt: true },
      where: {
        id,
        hostUserId: hostId,
      },
    });
  }

  async findOneById(
    id: string,
  ): Promise<{ id: string; hostUserId: string; endedAt: Date | null } | null> {
    return await this.txHost.tx.activeGathering.findUnique({
      select: { id: true, hostUserId: true, endedAt: true },
      where: { id },
    });
  }

  async update(id: string, data: Partial<GatheringEntity>): Promise<void> {
    await this.txHost.tx.gathering.update({
      data,
      where: {
        id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.txHost.tx.gathering.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id,
      },
    });
  }
}
