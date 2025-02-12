import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { SelectQueryBuilder, sql } from 'kysely';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { Feed, FeedPaginationInput } from 'src/domain/types/feed.types';
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
    return await this.txHost.tx.feed.findUnique({
      select: { writerId: true },
      where: { id },
    });
  }

  async findOneByIdAndWriter(
    feedId: string,
    writerId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.feed.findFirst({
      where: {
        id: feedId,
        writerId,
        writer: {
          deletedAt: null,
        },
      },
    });
  }

  async findOneByGatheringIdAndWriterId(
    gatheringId: string,
    writerId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.feed.findFirst({
      select: { id: true },
      where: {
        gatheringId,
        writerId,
        writer: {
          deletedAt: null,
        },
      },
    });
  }

  async findFeeds(
    order: Order,
    subquery: SelectQueryBuilder<any, any, any>,
  ): Promise<Feed[]> {
    // NOTE active user feed 수정
    const feedCreatedAtOrder = order === 'DESC' ? 'desc' : 'asc';
    const rows = await this.txHost.tx.$kysely
      .selectFrom('feed as f')
      .innerJoin('user as u', 'f.writer_id', 'u.id')
      .leftJoin('feed_image as fi', 'f.id', 'fi.feed_id')
      .leftJoin('gathering as g', 'f.gathering_id', 'g.id')
      .leftJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
      .leftJoin('user as gm', 'gp.participant_id', 'gm.id')
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
          .selectFrom('feed_comment as fc')
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
          commentCount: Number(row.comment_count ?? 0),
          content: row.content,
          createdAt: row.created_at,
          writer: {
            id: row.writer_id,
            accountId: row.writer_account_id,
            name: row.writer_name,
            profileImageUrl: row.writer_profile_image_url,
          },
          gathering: null,
          images: [],
        };
      }

      if (row.image_url && !result[row.id].images.includes(row.image_url)) {
        result[row.id].images.push(row.image_url);
      }

      if (!result[row.id].gathering && row.gathering_id) {
        result[row.id].gathering = {
          // gathering의 컬럼들은 not null이므로 id가 있다면 다른 속성은 항상 존재함.
          id: row.gathering_id,
          gatheringDate: row.gathering_date!,
          name: row.gathering_name!,
          members: [],
        };
      }

      if (
        row.member_id &&
        !result[row.id].gathering?.members.some((m) => m.id === row.member_id)
      ) {
        result[row.id].gathering?.members.push({
          // user의 컬럼들은 모두 not null이므로 id가 있다면 다른 속성은 항상 존재함.
          id: row.member_id,
          accountId: row.member_account_id!,
          name: row.member_name!,
          profileImageUrl: row.member_profile_image_url!,
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

    const query = this.txHost.tx.$kysely
      .selectFrom('feed as f')
      .select(['f.id'])
      .leftJoin('friend_feed_visibility as fv', 'f.id', 'fv.feed_id')
      .leftJoin('gathering as g', 'f.gathering_id', 'g.id')
      .leftJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
      .leftJoin('blocked_feed as bf', 'f.id', 'bf.feed_id')
      .where('f.deleted_at', 'is', null)
      .where('bf.user_id', 'is', null)
      .where((eb) =>
        eb.or([
          eb.and([
            eb('gp.participant_id', '=', userId),
            eb(
              'gp.status',
              '=',
              sql<GatheringParticipationStatus>`${GatheringParticipationStatus.ACCEPTED}::"GatheringParticipationStatus"`,
            ),
          ]),
          eb('g.host_user_id', '=', userId),
          eb('fv.user_id', '=', userId),
        ]),
      )
      .where('f.writer_id', '!=', userId)
      .where('f.created_at', '>=', new Date(minDate))
      .where('f.created_at', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb('f.created_at', cursorComparison, new Date(cursor.createdAt)),
          eb.and([
            eb('f.created_at', '=', new Date(cursor.createdAt)),
            eb('f.id', '>', cursor.id),
          ]),
        ]),
      )
      .groupBy('f.id')
      .orderBy('f.created_at', feedCreatedAtOrder)
      .orderBy('f.id', 'asc')
      .limit(limit);
    return await this.findFeeds(order, query);
  }

  async findByUserId(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
  ): Promise<Feed[]> {
    const { cursor, limit, minDate, maxDate, order } = feedPaginationInput;
    const feedCreatedAtOrder = order === 'DESC' ? 'desc' : 'asc';
    const cursorComparison = order === 'ASC' ? '>' : '<';

    const query = this.txHost.tx.$kysely
      .selectFrom('feed as fs')
      .select('fs.id')
      .leftJoin('blocked_feed as bf', 'fs.id', 'bf.feed_id')
      .where('bf.user_id', 'is', null)
      .where('fs.deleted_at', 'is', null)
      .where('fs.writer_id', '=', userId)
      .where('fs.created_at', '>=', new Date(minDate))
      .where('fs.created_at', '<=', new Date(maxDate))
      .where((eb) =>
        eb.or([
          eb('fs.created_at', cursorComparison, new Date(cursor.createdAt)),
          eb.and([
            eb('fs.created_at', '=', new Date(cursor.createdAt)),
            eb('fs.id', '>', cursor.id),
          ]),
        ]),
      )
      .groupBy('fs.id')
      .orderBy('fs.created_at', feedCreatedAtOrder)
      .orderBy('fs.id', 'asc')
      .limit(limit);
    return await this.findFeeds(order, query);
  }

  async findBlockedFeedsByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Feed[]> {
    const { cursor, limit } = paginationInput;

    const query = this.txHost.tx.$kysely
      .selectFrom('blocked_feed as bf')
      .innerJoin('feed as f', 'bf.feed_id', 'f.id')
      .select('f.id')
      .where('bf.user_id', '=', userId)
      .where((eb) =>
        eb.or([
          eb('f.created_at', '<', new Date(cursor.createdAt)),
          eb.and([
            eb('f.created_at', '=', new Date(cursor.createdAt)),
            eb('f.id', '>', cursor.id),
          ]),
        ]),
      )
      .orderBy('f.created_at', 'desc')
      .orderBy('f.id', 'asc')
      .limit(limit);

    return this.findFeeds('DESC', query);
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
