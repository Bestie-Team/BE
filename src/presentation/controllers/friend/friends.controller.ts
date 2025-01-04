import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendsService } from 'src/domain/services/friend/friends.service';
import { CreateFriendRequest } from 'src/presentation/dto/friend/create-friend.request';

@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  async request(
    @Body() dto: CreateFriendRequest,
    @CurrentUser() userId: string,
  ) {
    const { userId: receiverId } = dto;
    await this.friendsService.request({ senderId: userId, receiverId });
  }
}
