import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FeedCommentsReader } from 'src/domain/components/feed-comment/feed-comment-reader';
import { FeedCommentsService } from 'src/domain/services/feed-comments/feed-comments.service';
import { FeedCommentConverter } from 'src/presentation/converters/feed-comment/feed-comment.converters';
import { CreateFeedCommentRequest } from 'src/presentation/dto/comment/request/create-feed-comment.request';
import { FeedCommentResponse } from 'src/presentation/dto/comment/response/feed-comment-list.response';

@ApiTags('/feed-comments')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@Controller('feed-comments')
export class FeedCommentController {
  constructor(
    private readonly feedCommentService: FeedCommentsService,
    private readonly feedCommentReader: FeedCommentsReader,
  ) {}

  @ApiOperation({ summary: '피드 댓글 작성 ' })
  @ApiResponse({ status: 201, description: '댓글 작성 완료' })
  @Post()
  async create(
    @Body() dto: CreateFeedCommentRequest,
    @CurrentUser() userId: string,
  ) {
    await this.feedCommentService.create({ ...dto, writerId: userId });
  }

  @ApiOperation({ summary: '피드 댓글 조회' })
  @ApiResponse({
    status: 200,
    description: '댓글 조회 완료',
    type: [FeedCommentResponse],
  })
  @Get()
  async getComments(
    @Query('feedId', ParseUUIDPipe) feedId: string,
    @CurrentUser() userId: string,
  ): Promise<FeedCommentResponse[]> {
    const domain = await this.feedCommentReader.readAll(feedId, userId);
    return FeedCommentConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '피드 댓글 조회' })
  @ApiResponse({
    status: 204,
    description: '댓글 삭제 완료',
  })
  @ApiResponse({
    status: 403,
    description: '작성자 불일치 삭제 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async delete(
    @Param('commentId') commentId: string,
    @CurrentUser() userId: string,
  ) {
    await this.feedCommentService.delete(commentId, userId);
  }
}
