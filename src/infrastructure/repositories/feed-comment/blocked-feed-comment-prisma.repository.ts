import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { BlockedFeedCommentEntity } from 'src/domain/entities/feed-comment/blocked-feed-comment.entity';
import { BlockedFeedCommentRepository } from 'src/domain/interface/feed-comment/blocked-feed-comment.repository';

@Injectable()
export class BlockedFeedCommentPrismaRepository
  implements BlockedFeedCommentRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: BlockedFeedCommentEntity): Promise<void> {
    await this.txHost.tx.blockedFeedComment.create({ data });
  }
}
