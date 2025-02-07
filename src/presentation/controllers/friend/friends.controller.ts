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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendsService } from 'src/domain/services/friend/friends.service';
import { CreateFriendRequest } from 'src/presentation/dto/friend/request/create-friend.request';
import { FriendListResponse } from 'src/presentation/dto/friend/response/friend-list.response';
import { FriendRequestListResponse } from 'src/presentation/dto/friend/response/friend-request-list.response';
import { SearchFriendRequest } from 'src/presentation/dto/friend/request/search-friend.request';
import { UserPaginationRequest } from 'src/presentation/dto/user/request/user-pagination.request';
import { ApiUserPaginationQuery } from 'src/common/decorators/swagger';

@ApiTags('/friends')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOperation({ summary: '친구 요청' })
  @ApiBody({ type: CreateFriendRequest })
  @ApiResponse({
    status: 201,
    description: '요청 완료',
  })
  @ApiResponse({
    status: 409,
    description:
      '이미 친구인 회원에게 요청을 보낸 경우, 이미 요청을 보냈거나 받은 회원에게 요청을 보낸 경우',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패, 신고한 회원에게 요청을 보낸 경우',
  })
  @Post()
  async request(
    @Body() dto: CreateFriendRequest,
    @CurrentUser() userId: string,
  ) {
    const { userId: receiverId } = dto;
    await this.friendsService.request({ senderId: userId, receiverId });
  }

  @ApiOperation({ summary: '친구 요청 수락' })
  @ApiParam({
    name: 'friendId',
    description: '친구 요청 번호',
  })
  @ApiResponse({
    status: 201,
    description: '친구 요청 수락 완료',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Post(':friendId/accept')
  async accept(
    @Param('friendId') friendId: string,
    @CurrentUser() userId: string,
  ) {
    await this.friendsService.accept(friendId, userId);
  }

  @ApiOperation({
    summary: '친구 요청 거절',
    description:
      '보낸 요청 취소에도 동일하게 사용하시면 돼요. 요청 목록 조회 응답의 id가 friendId입니다.',
  })
  @ApiParam({
    name: 'friendId',
    description: '친구 요청 번호',
  })
  @ApiResponse({
    status: 201,
    description: '친구 요청 거절 완료',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Post(':friendId/reject')
  async reject(
    @Param('friendId') friendId: string,
    @CurrentUser() userId: string,
  ) {
    await this.friendsService.reject(friendId, userId);
  }

  @ApiOperation({ summary: '친구 목록 조회' })
  @ApiUserPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '친구 목록 조회 성공',
    type: FriendListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Get()
  async getFriends(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendListResponse> {
    return await this.friendsService.getFriendsByUserId(userId, paginationDto);
  }

  @ApiOperation({ summary: '받은 친구 요청 목록 조회' })
  @ApiUserPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '받은 친구 요청 목록 조회 성공',
    type: FriendRequestListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
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

  @ApiOperation({ summary: '보낸 친구 요청 목록 조회' })
  @ApiUserPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '보낸 친구 요청 목록 조회 성공',
    type: FriendRequestListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Get('requests/sent')
  async getSentRequests(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendRequestListResponse> {
    return await this.friendsService.getSentRequestsByUserId(
      userId,
      paginationDto,
    );
  }

  @ApiOperation({ summary: '친구 검색' })
  @ApiQuery({
    name: 'search',
    description: '계정 아이디 검색어',
    type: 'string',
    example: 'lighty_id',
  })
  @ApiUserPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: FriendListResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @Get('search')
  async search(
    @Query() dto: SearchFriendRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendListResponse> {
    const { search, ...paginationInput } = dto;
    return await this.friendsService.search(userId, {
      search,
      paginationInput,
    });
  }

  @ApiOperation({ summary: '절교' })
  @ApiQuery({
    name: 'userId',
    description:
      '친구 관계를 끊을 회원의 번호. 회원 번호!! 친구 번호 말고 회원 번호',
  })
  @ApiResponse({
    status: 204,
    description: '절교 성공!',
  })
  @ApiResponse({
    status: 404,
    description: '친구가 아닌 경우 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async delete(
    @Query('userId', ParseUUIDPipe) friendUserId: string,
    @CurrentUser() userId: string,
  ) {
    await this.friendsService.delete(friendUserId, userId);
  }
}
