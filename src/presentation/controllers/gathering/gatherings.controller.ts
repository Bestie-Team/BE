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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GatheringCreationUseCase } from 'src/application/use-cases/gathering/gathering-creation.use-case';
import { GatheringInvitationAcceptanceUseCase } from 'src/application/use-cases/gathering/gathering-invitation-acceptance.use-case';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiFileOperation } from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGatheringInvitationImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GatheringInvitationsReader } from 'src/domain/services/gathering/gathering-invitations-reader';
import { GatheringInvitationsWriteService } from 'src/domain/services/gathering/gathering-invitations-write.service';
import { GatheringsReadService } from 'src/domain/services/gathering/gatherings-read.service';
import { GatheringsWriteService } from 'src/domain/services/gathering/gatherings-write.service';
import { gatheringInvitationConverter } from 'src/presentation/converters/gathering/gathering-invitation.converters';
import { gatheringConverter } from 'src/presentation/converters/gathering/gathering.converters';
import { FileRequest, UploadImageResponse } from 'src/presentation/dto';
import { AcceptGatheringInvitationRequest } from 'src/presentation/dto/gathering/request/accept-gathering-invitation.request';
import { CreateGatheringRequest } from 'src/presentation/dto/gathering/request/create-gathering.request';
import { GatheringInvitationListRequest } from 'src/presentation/dto/gathering/request/gathering-invitation-list.request';
import { GatheringListRequest } from 'src/presentation/dto/gathering/request/gathering-list.request';
import { NoFeedGatheringListRequest } from 'src/presentation/dto/gathering/request/no-feed-gathering-list.request';
import { RejectGatheringInvitationRequest } from 'src/presentation/dto/gathering/request/reject-gathering-invitation.request';
import { UpdateGatheringRequest } from 'src/presentation/dto/gathering/request/update-gathering.request';
import { EndedGatheringsListResponse } from 'src/presentation/dto/gathering/response/ended-gatherings-list.response';
import { GatheringDetailResponse } from 'src/presentation/dto/gathering/response/gathering-detail.response';
import { ReceivedGatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/received-gathering-invitation-list.response';
import { GatheringListResponse } from 'src/presentation/dto/gathering/response/gathering-list.response';
import { SentGatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/sent-gathering-invitation-list.response';

@ApiTags('/gatherings')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@UseGuards(AuthGuard)
@Controller('gatherings')
export class GatheringsController {
  constructor(
    private readonly gatheringsWriteService: GatheringsWriteService,
    private readonly gatheringsReadService: GatheringsReadService,
    private readonly gatheringInvitationsWriteService: GatheringInvitationsWriteService,
    private readonly gatheringInvitationsReadService: GatheringInvitationsReader,
    private readonly gatheringCreationUseCase: GatheringCreationUseCase,
    private readonly gatheringInvitationAcceptanceUseCase: GatheringInvitationAcceptanceUseCase,
  ) {}

  @ApiFileOperation()
  @ApiBody({ type: FileRequest })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    type: UploadImageResponse,
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
  @Post()
  async create(
    @Body() dto: CreateGatheringRequest,
    @CurrentUser() userId: string,
  ) {
    const { friendIds, ...rest } = dto;
    await this.gatheringCreationUseCase.execute(
      { ...rest, hostUserId: userId },
      friendIds,
    );
  }

  @ApiOperation({ summary: '피드를 작성하지 않은 모임 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '모임 목록 조회 완료',
    type: GatheringListResponse,
  })
  @Get('no-feed')
  async getGatheringsWithoutFeed(
    @Query() dto: NoFeedGatheringListRequest,
    @CurrentUser() userId: string,
  ) {
    const domain = await this.gatheringsReadService.getGatheringsWithoutFeed(
      userId,
      dto,
    );
    return gatheringConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '완료된 모임 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '완료된 모임 목록 조회 완료',
    type: EndedGatheringsListResponse,
  })
  @Get('ended')
  async getEndedGatherings(
    @Query() dto: GatheringListRequest,
    @CurrentUser() userId: string,
  ): Promise<EndedGatheringsListResponse> {
    const domain = await this.gatheringsReadService.getEndedGatherings(
      userId,
      dto,
    );
    return gatheringConverter.toEndedListDto(domain);
  }

  @ApiOperation({ summary: '참여 중인 모임 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '모임 목록 조회 완료',
    type: GatheringListResponse,
  })
  @Get()
  async getGatherings(
    @Query() dto: GatheringListRequest,
    @CurrentUser() userId: string,
  ): Promise<GatheringListResponse> {
    const domain = await this.gatheringsReadService.getWaitingGatherings(
      userId,
      dto,
    );
    return gatheringConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '모임 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '모임 상세 조회 완료',
    type: GatheringDetailResponse,
  })
  @Get(':gatheringId')
  async getDetail(
    @Param('gatheringId', ParseUUIDPipe) gatheringId: string,
  ): Promise<GatheringDetailResponse> {
    const domain = await this.gatheringsReadService.getDetail(gatheringId);
    return gatheringConverter.toDto(domain);
  }

  @ApiOperation({ summary: '모임 초대 수락' })
  @ApiResponse({
    status: 200,
    description: '모임 초대 수락 완료',
  })
  @Post('accept')
  async accept(
    @Body() dto: AcceptGatheringInvitationRequest,
    @CurrentUser() userId: string,
  ) {
    await this.gatheringInvitationAcceptanceUseCase.execute({
      ...dto,
      inviteeId: userId,
    });
  }

  @ApiOperation({ summary: '모임 초대 거절' })
  @ApiResponse({
    status: 200,
    description: '모임 초대 거절 완료',
  })
  @Post('reject')
  async reject(
    @Body() dto: RejectGatheringInvitationRequest,
    @CurrentUser() userId: string,
  ) {
    await this.gatheringInvitationsWriteService.reject(
      dto.invitationId,
      userId,
    );
  }

  @ApiOperation({ summary: '받은 모임 초대 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '받은 모임 초대 목록 조회 완료',
    type: ReceivedGatheringInvitationListResponse,
  })
  @Get('invitations/received')
  async getReceivedInvitations(
    @Query() dto: GatheringInvitationListRequest,
    @CurrentUser() userId: string,
  ): Promise<ReceivedGatheringInvitationListResponse> {
    const domain =
      await this.gatheringInvitationsReadService.getReceivedInvitations(
        userId,
        dto,
      );
    return gatheringInvitationConverter.toRecevedListDto(domain);
  }

  @ApiOperation({ summary: '보낸 모임 초대 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '보낸 모임 초대 목록 조회 완료',
    type: SentGatheringInvitationListResponse,
  })
  @Get('invitations/sent')
  async getSentInvitations(
    @Query() dto: GatheringInvitationListRequest,
    @CurrentUser() userId: string,
  ): Promise<SentGatheringInvitationListResponse> {
    const domain =
      await this.gatheringInvitationsReadService.getSentInvitations(
        userId,
        dto,
      );
    return gatheringInvitationConverter.toSentListDto(domain);
  }

  @ApiOperation({ summary: '모임 수정' })
  @ApiResponse({
    status: 204,
    description: '모임 수정 완료',
  })
  @ApiResponse({
    status: 403,
    description: '모임장이 아닌 경우 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':gatheringId')
  async update(
    @Param('gatheringId') gatheringId: string,
    @Body() dto: UpdateGatheringRequest,
    @CurrentUser() userId: string,
  ) {
    await this.gatheringsWriteService.update(gatheringId, dto, userId);
  }

  @ApiOperation({ summary: '모임 삭제' })
  @ApiResponse({
    status: 204,
    description: '모임 삭제 완료',
  })
  @ApiResponse({
    status: 403,
    description: '모임장이 아닌 경우 실패',
  })
  @ApiResponse({
    status: 422,
    description: '완료된 모임을 삭제하려는 경우 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':gatheringId')
  async delete(
    @Param('gatheringId', ParseUUIDPipe) gatheringId: string,
    @CurrentUser() userId: string,
  ) {
    await this.gatheringsWriteService.delete(gatheringId, userId);
  }
}
