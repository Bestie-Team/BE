import { Injectable } from '@nestjs/common';
import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class BlockedFeedsPrismaRepository implements BlockedFeedsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: BlockedFeedEntity): Promise<void> {
    await this.prisma.blockedFeed.create({
      data,
    });
  }
}
