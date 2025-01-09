import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGroupCoverImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GroupCreateService } from 'src/domain/services/group/group-create.service';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';

@ApiTags('/groups')
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsCreateService: GroupCreateService) {}

  @ApiOperation({ summary: '그룹 커버 이미지 업로드' })
  @ApiBody({ type: FileRequest })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    type: UploadImageResponse,
  })
  @ApiResponse({
    status: 400,
    description: '파일 형식 호환 x',
  })
  @ApiResponse({
    status: 413,
    description: '파일 사이즈 초과',
  })
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', CreateGroupCoverImageMulterOptions()),
  )
  @Post('cover/image')
  uploadCoverImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadImageResponse {
    return {
      imageUrl: `${IMAGE_BASE_URL}/${file.key}`,
    };
  }

  @ApiOperation({ summary: '그룹 생성' })
  @ApiBody({
    type: CreateGroupRequest,
  })
  @ApiResponse({
    status: 201,
    description: '그룹 생성 완료',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패, friendIds에 친구가 아닌 회원이 존재할 경우',
  })
  @Post()
  async create(@Body() dto: CreateGroupRequest, @CurrentUser() userId: string) {
    const { friendIds, ...rest } = dto;
    await this.groupsCreateService.create(
      { ownerId: userId, ...rest },
      friendIds,
    );
  }
}
