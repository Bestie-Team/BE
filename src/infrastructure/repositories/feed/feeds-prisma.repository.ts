import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { SelectQueryBuilder, sql } from 'kysely';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { Feed, FeedPaginationInput } from 'src/domain/types/feed.types';
import { getKyselyUuid } from 'src/infrastructure/prisma/get-kysely-uuid';
import { DateIdPaginationInput, Order } from 'src/shared/types';

@Injectable()
export class FeedsPrismaRepository implements FeedsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: FeedEntity, images: FeedImageEntity[]): Promise<void> {
    await this.txHost.tx.feed.create({
      data: {
        ...data,
        images: {
          createMany: {
            data: images,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<FeedEntity>): Promise<void> {
    await this.txHost.tx.feed.update({
      data,
      where: {
        id,
      },
    });
  }

  async findOneById(id: string): Promise<{ writerId: string } | null> {
    return await this.txHost.tx.activeFeed.findUnique({
      select: { writerId: true },
      where: { id },
    });
  }

  async findOneByIdAndWriter(
    feedId: string,
    writerId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.activeFeed.findFirst({
      where: {
        id: feedId,
        writerId,
      },
    });
  }

  async findOneByGatheringIdAndWriterId(
    gatheringId: string,
    writerId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.activeFeed.findFirst({
      select: { id: true },
      where: {
        gatheringId,
        writerId,
      },
    });
  }

  async findFeeds(
    userId: string,
    order: Order,
    subquery: SelectQueryBuilder<any, any, any>,
  ): Promise<Feed[]> {
    const feedCreatedAtOrder = order === 'DESC' ? 'desc' : 'asc';
    const rows = await this.txHost.tx.$kysely
      .selectFrom('active_feed as f')
      .innerJoin('active_user as u', 'f.writer_id', 'u.id')
      .leftJoin('feed_image as fi', 'f.id', 'fi.feed_id')
      .leftJoin('active_gathering as g', 'f.gathering_id', 'g.id')
      .leftJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
      .leftJoin('active_user as gm', 'gp.participant_id', 'gm.id')
      .select([
        'f.id',
        'f.content',
        'f.created_at',
        'u.id as writer_id',
        'u.account_id as writer_account_id',
        'u.name as writer_name',
        'u.profile_image_url as writer_profile_image_url',
        'fi.url as image_url',
        'g.id as gathering_id',
        'g.name as gathering_name',
        'g.gathering_date',
        'gm.id as member_id',
        'gm.name as member_name',
        'gm.profile_image_url as member_profile_image_url',
        'gm.account_id as member_account_id',
      ])
      .select((qb) => [
        qb
          .selectFrom('active_feed_comment as fc')
          .whereRef('fc.feed_id', '=', 'f.id')
          .where('fc.deleted_at', 'is', null)
          .select(({ fn }) => [fn.count<number>('fc.id').as('comment_count')])
          .as('comment_count'),
      ])
      .where('f.id', 'in', () => subquery)
      .orderBy('f.created_at', feedCreatedAtOrder)
      .orderBy('f.id', 'asc')
      .orderBy('fi.index')
      .orderBy('gm.name')
      .execute();

    const result: { [key: string]: Feed } = {};
    rows.forEach((row) => {
      if (!result.hasOwnProperty(row.id)) {
        result[row.id] = {
          id: row.id,
          commentCount: Number(row.comment_count || 0),
          content: row.content,
          createdAt: row.created_at,
          writer: {
            id: row.writer_id,
            accountId: row.writer_account_id,
            name: row.writer_name,
            profileImageUrl: row.writer_profile_image_url,
          },
          gathering:
            row.gathering_id && row.gathering_date && row.gathering_name
              ? {
                  id: row.gathering_id,
                  gatheringDate: row.gathering_date,
                  name: row.gathering_name,
                }
              : null,
          images: [],
          withMembers: [],
        };
      }

      if (
        row.image_url &&
        !result[row.id].images.find((i) => i === row.image_url)
      ) {
        result[row.id].images.push(row.image_url);
      }

      if (
        row.member_id &&
        row.member_account_id &&
        row.member_name &&
        row.writer_id !== row.member_id &&
        !result[row.id].withMembers.find((m) => m.id === row.member_id)
      ) {
        result[row.id].withMembers.push({
          id: row.member_id,
          accountId: row.member_account_id,
          name: row.member_name,
          profileImageUrl: row.member_profile_image_url,
        });
      }
    });

    return Object.values(result);
  }

  async findAllByUserId(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
  ): Promise<Feed[]> {
    const { cursor, limit, minDate, maxDate, order } = feedPaginationInput;
    const feedCreatedAtOrder = order === 'DESC' ? 'desc' : 'asc';
    const cursorComparison = order === 'ASC' ? '>' : '<';
    const userIdUuid = getKyselyUuid(userId);

    const query = this.txHost.tx.$kysely
      .selectFrom('active_feed as f')
      .leftJoin('active_gathering as g', 'g.id', 'f.gathering_id')
      .select('f.id')
      .where('f.id', 'not in', (qb) =>
        qb
          .selectFrom('blocked_feed as bf')
          .select('bf.feed_id')
          .where('bf.user_id', '=', userIdUuid),
      )
      .where((eb) =>
        eb.or([
          eb('g.host_user_id', '=', userIdUuid),
          eb('f.writer_id', '=', userIdUuid),
          eb('f.gathering_id', 'in', (qb) =>
            qb
              .selectFrom('gathering_participation as gp')
              .select('gp.gathering_id')
              .where((eb) =>
                eb.and([
                  eb('gp.participant_id', '=', userIdUuid),
                  eb(
                    'gp.status',
                    '=',
                    sql<GatheringParticipationStatus>`${GatheringParticipationStatus.ACCEPTED}::"GatheringParticipationStatus"`,
                  ),
                ]),
              ),
          ),
          eb.and([
            eb('f.gathering_id', 'is', null),
            eb('f.id', 'in', (qb) =>
              qb
                .selectFrom('friend_feed_visibility as fv')
                .select('fv.feed_id')
                .where('fv.user_id', '=', userIdUuid),
            ),
          ]),
        ]),
      )
      .where('f.created_at', '>=', new Date(minDate))
      .where('f.created_at', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb('f.created_at', cursorComparison, new Date(cursor.createdAt)),
          eb.and([
            eb('f.created_at', '=', new Date(cursor.createdAt)),
            eb('f.id', '>', getKyselyUuid(cursor.id)),
          ]),
        ]),
      )
      .orderBy('f.created_at', feedCreatedAtOrder)
      .orderBy('f.id', 'asc')
      .limit(limit);

    return await this.findFeeds(userId, order, query);
  }

  async findByUserId(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
  ): Promise<Feed[]> {
    const { cursor, limit, minDate, maxDate, order } = feedPaginationInput;
    const feedCreatedAtOrder = order === 'DESC' ? 'desc' : 'asc';
    const cursorComparison = order === 'ASC' ? '>' : '<';
    const userIdUuid = getKyselyUuid(userId);

    const query = this.txHost.tx.$kysely
      .selectFrom('active_feed as f')
      .select('f.id')
      // NOTE 자신의 게시글을 숨기는 기능이 필요할까...
      .where('f.id', 'not in', (qb) =>
        qb
          .selectFrom('blocked_feed as bf')
          .select('bf.feed_id as id')
          .where('bf.user_id', '=', userIdUuid),
      )
      .where('f.writer_id', '=', userIdUuid)
      .where('f.created_at', '>=', new Date(minDate))
      .where('f.created_at', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb('f.created_at', cursorComparison, new Date(cursor.createdAt)),
          eb.and([
            eb('f.created_at', '=', new Date(cursor.createdAt)),
            eb('f.id', '>', getKyselyUuid(cursor.id)),
          ]),
        ]),
      )
      .groupBy(['f.id', 'f.created_at'])
      .orderBy('f.created_at', feedCreatedAtOrder)
      .orderBy('f.id', 'asc')
      .limit(limit);
    return await this.findFeeds(userId, order, query);
  }

  async findBlockedFeedsByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Feed[]> {
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const query = this.txHost.tx.$kysely
      .selectFrom('blocked_feed as bf')
      .innerJoin('active_feed as f', 'bf.feed_id', 'f.id')
      .select('f.id')
      .where('bf.user_id', '=', userIdUuid)
      .where((eb) =>
        eb.or([
          eb('f.created_at', '<', new Date(cursor.createdAt)),
          eb.and([
            eb('f.created_at', '=', new Date(cursor.createdAt)),
            eb('f.id', '>', getKyselyUuid(cursor.id)),
          ]),
        ]),
      )
      .orderBy('f.created_at', 'desc')
      .orderBy('f.id', 'asc')
      .limit(limit);

    return this.findFeeds(userId, 'DESC', query);
  }

  async delete(id: string): Promise<void> {
    await this.txHost.tx.feed.update({
      data: { deletedAt: new Date() },
      where: {
        id,
      },
    });
  }
}
