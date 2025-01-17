import { Injectable } from '@nestjs/common';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedComment } from 'src/domain/types/feed-comment.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class FeedCommentPrismaRepository implements FeedCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: FeedCommentEntity): Promise<void> {
    await this.prisma.feedComment.create({
      data,
    });
  }

  async findByFeedId(feedId: string): Promise<FeedComment[]> {
    return await this.prisma.feedComment.findMany({
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
      },
      where: {
        feedId,
      },
    });
  }
}
