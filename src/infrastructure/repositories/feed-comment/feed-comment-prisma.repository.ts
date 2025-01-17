import { Injectable } from '@nestjs/common';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class FeedCommentPrismaRepository implements FeedCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: FeedCommentEntity): Promise<void> {
    await this.prisma.feedComment.create({
      data,
    });
  }
}
