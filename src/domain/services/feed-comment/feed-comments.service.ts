import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedCommentPrototype } from 'src/domain/types/feed-comment.types';

@Injectable()
export class FeedCommentsService {
  constructor(
    @Inject(FeedCommentRepository)
    private readonly feedCommentRepository: FeedCommentRepository,
  ) {}

  async save(prototype: FeedCommentPrototype) {
    const stdDate = new Date();
    const comment = FeedCommentEntity.create(prototype, v4, stdDate);
    await this.feedCommentRepository.save(comment);
  }
}
