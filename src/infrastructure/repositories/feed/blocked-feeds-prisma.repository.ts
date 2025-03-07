import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';

@Injectable()
export class BlockedFeedsPrismaRepository implements BlockedFeedsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: BlockedFeedEntity): Promise<void> {
    await this.txHost.tx.blockedFeed.create({
      data,
    });
  }

  async delete(userId: string, feedId: string): Promise<void> {
    await this.txHost.tx.blockedFeed.delete({
      where: {
        userId_feedId: {
          userId,
          feedId,
        },
      },
    });
  }
}
