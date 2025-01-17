import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FeedCommentsService } from 'src/domain/services/feed-comment/feed-comments.service';
import { CreateFeedCommentRequest } from 'src/presentation/dto/comment/request/create-feed-comment.request';

@ApiTags('/feed-comments')
@UseGuards(AuthGuard)
@Controller('feed-comments')
export class FeedCommentController {
  constructor(private readonly feedCommentService: FeedCommentsService) {}

  @ApiOperation({ summary: '피드 댓글 작성 ' })
  @ApiResponse({ status: 201, description: '댓글 작성 완료' })
  @Post()
  async create(
    @Body() dto: CreateFeedCommentRequest,
    @CurrentUser() userId: string,
  ) {
    await this.feedCommentService.save({ ...dto, writerId: userId });
  }
}
