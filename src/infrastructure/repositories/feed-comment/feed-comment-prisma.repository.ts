import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedComment } from 'src/domain/types/feed-comment.types';

@Injectable()
export class FeedCommentPrismaRepository implements FeedCommentRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: FeedCommentEntity): Promise<void> {
    await this.txHost.tx.feedComment.create({
      data,
    });
  }

  async findByFeedId(feedId: string, userId: string): Promise<FeedComment[]> {
    const blockedComments = await this.txHost.tx.blockedFeedComment.findMany({
      where: {
        userId,
      },
      select: {
        commentId: true,
      },
    });

    const blockedCommentIds = blockedComments.map((bc) => bc.commentId);

    return await this.txHost.tx.feedComment.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        writer: {
          select: {
            id: true,
            accountId: true,
            name: true,
            profileImageUrl: true,
          },
        },
        mentionedUser: {
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
        deletedAt: null,
        writer: {
          deletedAt: null,
        },
        id: {
          notIn: blockedCommentIds,
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<{ writerId: string } | null> {
    return await this.txHost.tx.activeFeedComment.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.txHost.tx.feedComment.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id,
      },
    });
  }
}
