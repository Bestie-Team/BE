import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateFeedImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { FeedsWriteService } from 'src/domain/services/feed/feeds-write.service';
import { CreateFriendFeedRequest } from 'src/presentation/dto/feed/request/create-friend-feed.request';
import { CreateGatheringFeedRequest } from 'src/presentation/dto/feed/request/create-gathering-feed.request';
import { UpdateFeedRequest } from 'src/presentation/dto/feed/request/update-feed.request';
import { FileListRequest } from 'src/presentation/dto/file/request/file-list.request';
import { UploadImageListResponse } from 'src/presentation/dto/file/response/upload-image-list.response';

@ApiTags('/feeds')
@UseGuards(AuthGuard)
@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsWriteService: FeedsWriteService) {}

  @ApiOperation({
    summary: '피드 사진 업로드',
    description: 'files입니다 파일즈 ssssssss',
  })
  @ApiBody({ type: FileListRequest })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    type: UploadImageListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '파일 형식 호환 x, 업로드 이미지 5장 초과',
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
    summary: '모임 피드 작성',
    description: 'gatheringId를 null로 주시면 개인 피드로 인식합니다.',
  })
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
    await this.feedsWriteService.createGatheringFeed(
      {
        ...rest,
        writerId: userId,
      },
      imageUrls,
    );
  }

  @Post('friends')
  async createFriendFeed(
    @Body() dto: CreateFriendFeedRequest,
    @CurrentUser() userId: string,
  ) {}

  @ApiOperation({ summary: '게시글 내용 수정' })
  @ApiBody({
    type: UpdateFeedRequest,
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
}
