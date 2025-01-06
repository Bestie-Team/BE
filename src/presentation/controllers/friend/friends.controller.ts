import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendsService } from 'src/domain/services/friend/friends.service';
import { CreateFriendRequest } from 'src/presentation/dto/friend/create-friend.request';
import { FriendListResponse } from 'src/presentation/dto/friend/friend-list.response';
import { FriendRequestListResponse } from 'src/presentation/dto/friend/friend-request-list.response';
import { UserPaginationRequest } from 'src/presentation/dto/user/user-pagination.request';

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

  @Post(':friendId/accept')
  async accept(
    @Param('friendId') friendId: string,
    @CurrentUser() userId: string,
  ) {
    await this.friendsService.accept(friendId, userId);
  }

  @Post(':friendId/reject')
  async reject(
    @Param('friendId') friendId: string,
    @CurrentUser() userId: string,
  ) {
    await this.friendsService.reject(friendId, userId);
  }

  @Get()
  async getFriends(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendListResponse> {
    return await this.friendsService.getFriendsByUserId(userId, paginationDto);
  }

  @Get('requests/received')
  async getReceivedRequests(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendRequestListResponse> {
    return await this.friendsService.getReceivedRequestsByUserId(
      userId,
      paginationDto,
    );
  }
}
