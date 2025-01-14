import { Inject, Injectable } from '@nestjs/common';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FeedPrototype } from 'src/domain/types/feed.types';
import { v4 } from 'uuid';

@Injectable()
export class FeedsWriteService {
  constructor(
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
  ) {}

  async create(prototype: FeedPrototype, imageUrls: string[]) {
    const stdDate = new Date();
    const feed = FeedEntity.create(prototype, v4, stdDate);
    const images: FeedImageEntity[] = imageUrls.map((url) =>
      FeedImageEntity.create(url, v4, stdDate),
    );

    await this.feedsRepository.save(feed, images);
  }
}
