import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGatheringInvitationImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GatheringInvitationsReadService } from 'src/domain/services/gathering/gathering-invitations-read.service';
import { GatheringsWriteService } from 'src/domain/services/gathering/gatherings-write.service';
import { gatheringInvitationConverter } from 'src/presentation/converters/gathering/gathering-invitation.converters';
import { FileRequest, UploadImageResponse } from 'src/presentation/dto';
import { CreateGatheringRequest } from 'src/presentation/dto/gathering/request/create-gathering.request';
import { GatheringInvitationListRequest } from 'src/presentation/dto/gathering/request/gathering-invitation-list.request';
import { GatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/gathering-invitation-list.response';

@ApiTags('/gathering')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('gatherings')
export class GatheringsController {
  constructor(
    private readonly gatheringsWriteService: GatheringsWriteService,
    private readonly gatheringInvitationsReadService: GatheringInvitationsReadService,
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

  @ApiOperation({ summary: '모임 초대 거절' })
  @ApiParam({
    name: 'invitationId',
    type: 'string',
    description: '거절할 모임 초대 번호',
  })
  @ApiResponse({
    status: 200,
    description: '모임 초대 거절 완료',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Post(':invitationId/reject')
  async reject(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() userId: string,
  ) {
    await this.gatheringsWriteService.reject(invitationId, userId);
  }

  @ApiOperation({ summary: '받은 모임 초대 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '받은 모임 초대 목록 조회 완료',
    type: GatheringInvitationListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Get('invitations/received')
  async getReceivedInvitations(
    @Query() dto: GatheringInvitationListRequest,
    @CurrentUser() userId: string,
  ): Promise<GatheringInvitationListResponse> {
    const domain =
      await this.gatheringInvitationsReadService.getReceivedInvitations(
        userId,
        dto,
      );
    return gatheringInvitationConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '받은 모임 초대 목록 조회' })
  @ApiQuery({
    name: 'cursor',
    description: '초대일',
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiResponse({
    status: 200,
    description: '받은 모임 초대 목록 조회 완료',
    type: GatheringInvitationListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Get('invitations/sent')
  async getSentInvitations(
    @Query() dto: GatheringInvitationListRequest,
    @CurrentUser() userId: string,
  ): Promise<GatheringInvitationListResponse> {
    const domain =
      await this.gatheringInvitationsReadService.getSentInvitations(
        userId,
        dto,
      );
    return gatheringInvitationConverter.toListDto(domain);
  }
}
