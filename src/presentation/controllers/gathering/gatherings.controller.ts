import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGatheringInvitationImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GatheringsWriteService } from 'src/domain/services/gathering/gatherings-write.service';
import { FileRequest, UploadImageResponse } from 'src/presentation/dto';
import { CreateGatheringRequest } from 'src/presentation/dto/gathering/request/create-gathering.request';

@ApiTags('/gathering')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('gatherings')
export class GatheringsController {
  constructor(
    private readonly gatheringsWriteService: GatheringsWriteService,
  ) {}

  @ApiOperation({ summary: '모임 초대장 이미지 업로드' })
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
    FileInterceptor('file', CreateGatheringInvitationImageMulterOptions()),
  )
  @Post('invitation/image')
  uploadInvitationImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadImageResponse {
    return {
      imageUrl: `${IMAGE_BASE_URL}/${file.key}`,
    };
  }

  @ApiOperation({ summary: '모임 생성' })
  @ApiBody({
    type: CreateGatheringRequest,
  })
  @ApiResponse({
    status: 201,
    description: '모임 생성 완료',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패, friendIds에 친구가 아닌 회원이 존재할 경우',
  })
  @Post()
  async create(
    @Body() dto: CreateGatheringRequest,
    @CurrentUser() userId: string,
  ) {
    const { friendIds, ...rest } = dto;
    await this.gatheringsWriteService.create(
      { ...rest, hostUserId: userId },
      friendIds,
    );
  }

  @ApiOperation({ summary: '모임 초대 수락' })
  @ApiParam({
    name: 'invitationId',
    type: 'string',
    description: '수락할 모임 초대 번호',
  })
  @ApiResponse({
    status: 200,
    description: '모임 초대 수락 완료',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Post(':invitationId/accept')
  async accept(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() userId: string,
  ) {
    await this.gatheringsWriteService.accept(invitationId, userId);
  }
}
