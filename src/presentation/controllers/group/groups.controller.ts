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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GroupCreationUseCase } from 'src/application/use-cases/group/group-creation.use-case';
import { BUCKET_IMAGE_PATH, IMAGE_BASE_URL } from 'src/common/constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ApiFileOperation,
  ApiGroupPaginationQuery,
  ApiPresignedUrlOperation,
} from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGroupCoverImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import {
  AddGroupMemberRequest,
  GroupDetailResponse,
  PaginationRequest,
} from 'src/presentation/dto';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';
import { UpdateGroupRequest } from 'src/presentation/dto/group/request/update-group.request';
import { GroupListResponse } from 'src/presentation/dto/group/response/group-list.response';
import { GroupsService } from 'src/domain/services/groups/groups.service';
import { groupConverter } from 'src/presentation/converters/group/group.converters';
import { PresignedUrlResponse } from 'src/presentation/dto/file/response/presigned-url.response';
import { S3PresignedManager } from 'src/infrastructure/aws/s3/s3-presigned-manager';

@ApiTags('/groups')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(
    // private readonly groupsWriteService: GroupsWriter,
    private readonly groupsService: GroupsService,
    private readonly groupsReader: GroupsReader,
    private readonly groupCreationUseCase: GroupCreationUseCase,
    private readonly s3PresignedManager: S3PresignedManager,
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

  @ApiPresignedUrlOperation()
  @Get('cover/presigned')
  async getPresignedUrl(): Promise<PresignedUrlResponse> {
    return await this.s3PresignedManager.getPresignedUrl(
      BUCKET_IMAGE_PATH.GROUP,
    );
  }

  @ApiOperation({ summary: '그룹 생성' })
  @ApiBody({
    type: CreateGroupRequest,
  })
  @ApiResponse({
    status: 201,
    description: '그룹 생성 완료',
  })
  @Post()
  async create(@Body() dto: CreateGroupRequest, @CurrentUser() userId: string) {
    const { friendIds, ...rest } = dto;
    await this.groupCreationUseCase.execute(
      { ownerId: userId, ...rest },
      friendIds,
    );
  }

  @ApiOperation({ summary: '참여 그룹 목록 조회' })
  @ApiGroupPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '그룹 목록 조회 완료',
    type: GroupListResponse,
  })
  @Get()
  async getGroups(
    @Query() paginationDto: PaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<GroupListResponse> {
    const domain = await this.groupsReader.read(userId, paginationDto);
    return groupConverter.toListDto(domain);
  }

  @ApiOperation({ summary: '그룹 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '그룹 상세 조회 완료',
    type: GroupDetailResponse,
  })
  @Get(':groupId')
  async getGroupDetail(
    @Param('groupId') groupId: string,
  ): Promise<GroupDetailResponse> {
    const domain = await this.groupsReader.readDetail(groupId);
    return groupConverter.toDto(domain);
  }

  @ApiOperation({ summary: '그룹원 추가' })
  @ApiParam({
    name: 'groupId',
    type: 'string',
    description: '추가할 대상 그룹',
  })
  @ApiBody({
    type: AddGroupMemberRequest,
  })
  @ApiResponse({
    status: 201,
    description: '그룹원 추가 완료',
  })
  @ApiResponse({
    status: 409,
    description: '이미 참여 중인 회원을 초대하는 경우 실패',
  })
  @ApiResponse({
    status: 422,
    description: '해당 그룹을 신고한 회원을 초대하려는 경우 실패',
  })
  @Post(':groupId/members')
  async addMembers(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: AddGroupMemberRequest,
    @CurrentUser() userId: string,
  ) {
    const { userIds: participantIds } = dto;
    await this.groupsService.addMembers(groupId, userId, participantIds);
  }

  @ApiOperation({ summary: '그룹 나가기 (그룹원)' })
  @ApiParam({
    name: 'groupId',
    type: 'string',
    description: '나갈 대상 그룹',
  })
  @ApiResponse({
    status: 204,
    description: '그룹 나가기 완료',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId/members')
  async leave(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @CurrentUser() userId: string,
  ) {
    await this.groupsService.leaveGroup(groupId, userId);
  }

  @ApiOperation({
    summary: '그룹 정보 수정',
    description: '변경되지 않는 속성은 기존 값을 넣어서 주세요.',
  })
  @ApiResponse({
    status: 204,
    description: '수정 완료',
  })
  @ApiResponse({
    status: 403,
    description: '그룹장이 아닌 경우 수정 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':groupId')
  async update(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateGroupRequest,
    @CurrentUser() userId: string,
  ) {
    await this.groupsService.update(groupId, userId, dto);
  }

  @ApiOperation({ summary: '그룹 삭제 (그룹장)' })
  @ApiParam({
    name: 'groupId',
    type: 'string',
    description: '삭제할 대상 그룹',
  })
  @ApiResponse({
    status: 204,
    description: '그룹 삭제 완료',
  })
  @ApiResponse({
    status: 403,
    description: '그룹장이 아닌 경우 삭제 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId')
  async delete(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @CurrentUser() userId: string,
  ) {
    await this.groupsService.delete(groupId, userId);
  }
}
