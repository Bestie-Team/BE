import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';

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
}
