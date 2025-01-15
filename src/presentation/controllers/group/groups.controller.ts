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
import { ApiGroupPaginationQuery } from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGroupCoverImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GroupCreateService } from 'src/domain/services/group/group-create.service';
import { GroupsService } from 'src/domain/services/group/groups.service';
import { toListDto } from 'src/presentation/converters/group/group.converters';
import { AddGroupMemberRequest, PaginationRequest } from 'src/presentation/dto';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';
import { GroupListResponse } from 'src/presentation/dto/group/response/group-list.response';

@ApiTags('/groups')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsCreateService: GroupCreateService,
    private readonly groupsService: GroupsService,
  ) {}

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

  @ApiOperation({ summary: '참여 그룹 목록 조회' })
  @ApiGroupPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '그룹 목록 조회 완료',
    type: GroupListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Get()
  async getGroups(
    @Query() paginationDto: PaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<GroupListResponse> {
    const domain = await this.groupsService.getGroupsByUserId(
      userId,
      paginationDto,
    );
    return toListDto(domain);
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
    status: 400,
    description: '입력값 검증 실패',
  })
  @Post(':groupId/members')
  async addMembers(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: AddGroupMemberRequest,
    @CurrentUser() userId: string,
  ) {
    const { userIds: participantIds } = dto;
    await this.groupsCreateService.addNewMembers(
      groupId,
      userId,
      participantIds,
    );
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
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId/members')
  async leave(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @CurrentUser() userId: string,
  ) {
    await this.groupsCreateService.leaveGroup(groupId, userId);
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
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId')
  async delete(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @CurrentUser() userId: string,
  ) {
    await this.groupsCreateService.deleteGroup(groupId, userId);
  }
}
