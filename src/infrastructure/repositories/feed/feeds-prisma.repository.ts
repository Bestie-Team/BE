import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

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
            data: images.map((image) => ({ ...image, index: 0 })),
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
}
