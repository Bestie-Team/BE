import { Injectable } from '@nestjs/common';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class FeedsPrismaRepository implements FeedsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: FeedEntity, images: FeedImageEntity[]): Promise<void> {
    await this.prisma.feed.create({
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
    await this.prisma.feed.update({
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
    return await this.prisma.feed.findFirst({
      where: {
        id: feedId,
        writerId,
      },
    });
  }
}
