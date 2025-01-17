import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { sql } from 'kysely';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { Feed, FeedPaginationInput } from 'src/domain/types/feed.types';

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

  async findOneByIdAndWriter(
    feedId: string,
    writerId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.feed.findFirst({
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
    return await this.txHost.tx.feed.findFirst({
      select: { id: true },
      where: {
        gatheringId,
        writerId,
      },
    });
  }

  async findByUserId(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
  ): Promise<Feed[]> {
    const { cursor, limit, minDate, maxDate, order } = feedPaginationInput;
    const feedCreatedAtOrder = order === 'DESC' ? 'desc' : 'asc';
    const cursorComparison = order === 'ASC' ? '>' : '<';
    const rows = await this.txHost.tx.$kysely
      .selectFrom('feed as f')
      .innerJoin('user as u', 'f.writer_id', 'u.id')
      .innerJoin('feed_image as fi', 'f.id', 'fi.feed_id')
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
      .where('f.id', 'in', (qb) =>
        qb
          .selectFrom('feed as f')
          .select(['f.id'])
          .leftJoin('friend_feed_visibility as fv', 'f.id', 'fv.feed_id')
          .leftJoin('gathering as g', 'f.gathering_id', 'g.id')
          .leftJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
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
          .orderBy('f.id')
          .limit(limit),
      )
      .orderBy('f.created_at', feedCreatedAtOrder)
      .orderBy('f.id')
      .orderBy('fi.index')
      .orderBy('gm.name')
      .execute();

    const result: { [key: string]: Feed } = {};

    rows.forEach((row) => {
      if (!result.hasOwnProperty(row.id)) {
        result[row.id] = {
          id: row.id,
          content: row.content,
          commentCount: 0,
          createdAt: row.created_at,
          images: [],
          gathering: null,
          writer: {
            id: row.writer_id,
            name: row.writer_name,
            accountId: row.writer_account_id,
            profileImageUrl: row.writer_profile_image_url,
          },
        };
      }

      if (!result[row.id].images.some((image) => image === row.image_url)) {
        result[row.id].images.push(row.image_url);
      }

      if (
        !result[row.id].gathering &&
        row.gathering_id &&
        row.gathering_name &&
        row.gathering_date
      ) {
        result[row.id].gathering = {
          id: row.gathering_id,
          name: row.gathering_name,
          gatheringDate: row.gathering_date,
          members: [],
        };
      }

      if (
        result[row.id].gathering &&
        row.member_id &&
        row.member_name &&
        row.member_account_id &&
        row.member_profile_image_url
      ) {
        const existingMember = result[row.id].gathering!.members.find(
          (member) => member.id === row.member_id,
        );

        if (!existingMember) {
          result[row.id].gathering!.members.push({
            id: row.member_id,
            name: row.member_name,
            profileImageUrl: row.member_profile_image_url,
            accountId: row.member_account_id,
          });
        }
      }
    });

    const feeds = Object.values(result);
    for (const feed of feeds) {
      feed.commentCount = Number(await this.countComments(feed.id));
    }

    return feeds;
  }

  async countComments(feedId: string) {
    const row = await this.txHost.tx.$kysely
      .selectFrom('feed_comment as c')
      .select(({ fn }) => [fn.count<number>('c.id').as('comment_count')])
      .where('c.feed_id', '=', feedId)
      .executeTakeFirst();
    return row?.comment_count || 0;
  }
}
