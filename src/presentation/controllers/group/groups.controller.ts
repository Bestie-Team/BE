import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GroupCreateService } from 'src/domain/services/group/group-create.service';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';

@ApiTags('/groups')
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsCreateService: GroupCreateService) {}

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
