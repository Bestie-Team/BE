import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GroupCreateService } from 'src/domain/services/group/group-create.service';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';

@ApiTags('/groups')
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsCreateService: GroupCreateService) {}

  @Post()
  async create(@Body() dto: CreateGroupRequest, @CurrentUser() userId: string) {
    const { friendIds, ...rest } = dto;
    await this.groupsCreateService.create(
      { ownerId: userId, ...rest },
      friendIds,
    );
  }
}
