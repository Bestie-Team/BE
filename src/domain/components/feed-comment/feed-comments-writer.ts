import { Inject, Injectable } from '@nestjs/common';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';

@Injectable()
export class FeedCommentsWriter {
  constructor(
    @Inject(FeedCommentRepository)
    private readonly feedCommentRepository: FeedCommentRepository,
  ) {}

  async create(comment: FeedCommentEntity) {
    await this.feedCommentRepository.save(comment);
  }

  async delete(id: string) {
    await this.feedCommentRepository.delete(id);
  }
}
