import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { User } from 'src/domain/types/user.types';
import { getKyselyUuid } from 'src/infrastructure/prisma/get-kysely-uuid';

@Injectable()
export class FriendFeedVisibilitiesPrismaRepository
  implements FriendFeedVisibilitiesRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async saveMany(data: FriendFeedVisibilityEntity[]): Promise<void> {
    await this.txHost.tx.friendFeedVisibility.createMany({
      data,
    });
  }

  async findVisibleUsersByFeedIds(feedIds: string[]): Promise<{
    [feedId: string]: User[];
  }> {
    const rows = await this.txHost.tx.$kysely
      .selectFrom('friend_feed_visibility as fv')
      .innerJoin('active_user as au', 'au.id', 'fv.user_id')
      .select([
        'fv.feed_id',
        'au.id',
        'au.account_id',
        'au.name',
        'au.profile_image_url',
      ])
      .where(
        'fv.feed_id',
        'in',
        feedIds.map((feedId) => getKyselyUuid(feedId)),
      )
      .execute();

    const result: { [feedId: string]: User[] } = {};
    rows.forEach((row) => {
      if (!result.hasOwnProperty(row.feed_id)) {
        result[row.feed_id] = [];
      }
      result[row.feed_id].push({
        id: row.id,
        accountId: row.account_id,
        name: row.name,
        profileImageUrl: row.profile_image_url,
      });
    });

    return result;
  }

  async findVisibleUsersByFeedId(feedId: string): Promise<User[]> {
    const result = await this.txHost.tx.friendFeedVisibility.findMany({
      select: {
        user: {
          select: {
            id: true,
            accountId: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
      where: {
        feedId,
      },
    });

    return result.map((data) => data.user);
  }
}
