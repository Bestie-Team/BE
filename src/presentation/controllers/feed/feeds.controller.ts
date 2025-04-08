import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BUCKET_IMAGE_PATH, IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateFeedImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { BlockedFeedsService } from 'src/domain/components/feed/blocked-feeds.service';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { FeedsWriter } from 'src/domain/components/feed/feeds-writer';
import { FriendFeedVisibilityReader } from 'src/domain/components/friend-feed-visibility/friend-feed-visibility-reader';
import { GatheringInvitationsReader } from 'src/domain/components/gathering/gathering-invitations-reader';
import { FeedsService } from 'src/domain/services/feed/feeds.service';
import { S3PresignedManager } from 'src/infrastructure/aws/s3/s3-presigned-manager';
import { feedConverter } from 'src/presentation/converters/feed/feed.converters';
import { BlockedFeedListRequest } from 'src/presentation/dto/feed/request/blocked-feed-list.request';
import { CreateFriendFeedRequest } from 'src/presentation/dto/feed/request/create-friend-feed.request';
import { CreateGatheringFeedRequest } from 'src/presentation/dto/feed/request/create-gathering-feed.request';
import { FeedListRequest } from 'src/presentation/dto/feed/request/feed-list.request';
import { UpdateFeedRequest } from 'src/presentation/dto/feed/request/update-feed.request';
import { FeedDetailResponse } from 'src/presentation/dto/feed/response/feed-detail.response';
import { FeedListResponse } from 'src/presentation/dto/feed/response/feed-list.response';
import { FileListRequest } from 'src/presentation/dto/file/request/file-list.request';
import { PresignedUrlResponse } from 'src/presentation/dto/file/response/presigned-url.response';
import { UploadImageListResponse } from 'src/presentation/dto/file/response/upload-image-list.response';

@ApiTags('/feeds')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@UseGuards(AuthGuard)
@Controller('feeds')
export class FeedsController {
  constructor(
    private readonly feedsWriteService: FeedsWriter,
    private readonly feedsReader: FeedsReader,
    private readonly feedsService: FeedsService,
    private readonly friendFeedVisibilityReader: FriendFeedVisibilityReader,
    private readonly blockedFeedsService: BlockedFeedsService,
    private readonly gatheringsParticipationReader: GatheringInvitationsReader,
    private readonly s3PresignedManager: S3PresignedManager,
  ) {}

  @ApiOperation({
    summary: '이미지 업로드',
    description: 'files입니다 파일즈 ssssssss, 한 파일당 4MB 최대 5개.',
  })
  @ApiBody({ type: FileListRequest })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    type: UploadImageListResponse,
  })
  @ApiResponse({
    status: 413,
    description: '파일 사이즈 초과',
  })
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('files', 5, CreateFeedImageMulterOptions()))
  @Post('images')
  uploadProfileImage(
    @UploadedFiles() files: Express.MulterS3.File[],
  ): UploadImageListResponse {
    return {
      imageUrls: files.map((file) => `${IMAGE_BASE_URL}/${file.key}`),
    };
  }

  @ApiOperation({
    summary: '프로필 사진 업로드 presigned url 생성',
    description: 'url 만료 시간 20초',
  })
  @ApiResponse({
    status: 200,
    description: 'presigned url 생성 성공',
    type: [PresignedUrlResponse],
  })
  @ApiQuery({ name: 'count', example: 5, description: '업로드할 이미지 수' })
  @Get('images/presigned')
  async getPresignedUrl(
    @Query('count') count: number,
  ): Promise<PresignedUrlResponse[]> {
    return await this.s3PresignedManager.getPresignedUrls(
      BUCKET_IMAGE_PATH.FEED,
      count,
    );
  }

  @ApiOperation({ summary: '모임 피드 작성' })
  @ApiBody({
    type: CreateGatheringFeedRequest,
  })
  @ApiResponse({
    status: 201,
    description: '피드 작성 완료',
  })
  @ApiResponse({
    status: 404,
    description: '피드의 주체인 모임이 존재하지 않는 경우',
  })
  @ApiResponse({
    status: 422,
    description:
      '모임이 완료되지 않은 경우, 모임이 완료된지 30일이 초과한 경우',
  })
  @ApiResponse({
    status: 409,
    description: '해당 모임에 이미 피드를 작성한 경우',
  })
  @Post('gatherings')
  async createGatheringFeed(
    @Body() dto: CreateGatheringFeedRequest,
    @CurrentUser() userId: string,
  ) {
    const { imageUrls, ...rest } = dto;
    await this.feedsService.createGatheringFeed(
      {
        ...rest,
        writerId: userId,
      },
      imageUrls,
    );
  }

  @ApiOperation({ summary: '일반 피드 작성' })
  @ApiBody({
    type: CreateFriendFeedRequest,
  })
  @ApiResponse({
    status: 201,
    description: '피드 작성 완료',
  })
  @Post('friends')
  async createFriendFeed(
    @Body() dto: CreateFriendFeedRequest,
    @CurrentUser() userId: string,
  ) {
    const { imageUrls, content, friendIds } = dto;
    await this.feedsService.createFriendFeed(
      {
        writerId: userId,
        gatheringId: null,
        content,
      },
      imageUrls,
      friendIds,
    );
  }

  @ApiOperation({ summary: '자신이 작성한 피드 목록 조회' })
  @ApiResponse({
    status: 200,
    type: FeedListResponse,
  })
  @Get('my')
  async getMyFeeds(
    @Query() dto: FeedListRequest,
    @CurrentUser() userId: string,
  ): Promise<FeedListResponse> {
    const domain = await this.feedsReader.readOwn(userId, dto);
    return feedConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '피드 목록 조회' })
  @ApiResponse({
    status: 200,
    type: FeedListResponse,
  })
  @Get()
  async getFeeds(
    @Query() dto: FeedListRequest,
    @CurrentUser() userId: string,
  ): Promise<FeedListResponse> {
    const domain = await this.feedsReader.readAll(userId, dto);
    return feedConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '피드 내용 수정' })
  @ApiBody({
    type: UpdateFeedRequest,
  })
  @ApiResponse({
    status: 204,
    description: '수정 완료',
  })
  @ApiResponse({
    status: 403,
    description: '작성자가 아닌 경우 수정 살패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':feedId')
  async updateContent(
    @Param('feedId', ParseUUIDPipe) feedId: string,
    @Body() dto: UpdateFeedRequest,
    @CurrentUser() userId: string,
  ) {
    const { content } = dto;
    await this.feedsWriteService.updateContent(content, feedId, userId);
  }

  @ApiOperation({ summary: '피드 삭제' })
  @ApiResponse({
    status: 204,
    description: '삭제 완료',
  })
  @ApiResponse({
    status: 403,
    description: '작성자가 아닌 경우 삭제 살패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':feedId')
  async delete(
    @Param('feedId', ParseUUIDPipe) feedId: string,
    @CurrentUser() userId: string,
  ) {
    await this.feedsWriteService.delete(feedId, userId);
  }

  @ApiOperation({ summary: '숨김 피드 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '숨김 피드 목록 조회',
    type: FeedListResponse,
  })
  @Get('blocked')
  async getBlockedFeeds(
    @Query() dto: BlockedFeedListRequest,
    @CurrentUser() userId: string,
  ): Promise<FeedListResponse> {
    const domain = await this.blockedFeedsService.getBlockedFeeds(userId, dto);
    return feedConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '피드 숨김' })
  @ApiResponse({
    status: 201,
    description: '숨김 완료',
  })
  @Post(':feedId/block')
  async block(@Param('feedId') feedId: string, @CurrentUser() userId: string) {
    await this.blockedFeedsService.block(userId, feedId);
  }

  @ApiOperation({ summary: '피드 상세 조회' })
  @ApiResponse({
    status: 200,
    type: FeedListResponse,
  })
  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<FeedDetailResponse> {
    const feed = await this.feedsReader.readDetail(id);
    const { gatheringId } = feed;

    const withMembers = gatheringId
      ? await this.gatheringsParticipationReader.readParticipants(gatheringId)
      : await this.friendFeedVisibilityReader.readMembers(feed.id);

    return feedConverter.toDetailDto(feed, withMembers);
  }

  @ApiOperation({ summary: '피드 숨김 해제' })
  @ApiResponse({
    status: 204,
    description: '숨김 해제 완료',
  })
  @Delete(':feedId/block')
  async unblock(
    @Param('feedId') feedId: string,
    @CurrentUser() userId: string,
  ) {
    await this.blockedFeedsService.unblock(userId, feedId);
  }
}
