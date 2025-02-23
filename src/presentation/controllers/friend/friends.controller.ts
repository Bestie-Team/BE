import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { CreateFriendRequest } from 'src/presentation/dto/friend/request/create-friend.request';
import { FriendListResponse } from 'src/presentation/dto/friend/response/friend-list.response';
import { FriendRequestListResponse } from 'src/presentation/dto/friend/response/friend-request-list.response';
import { SearchFriendRequest } from 'src/presentation/dto/friend/request/search-friend.request';
import { UserPaginationRequest } from 'src/presentation/dto/user/request/user-pagination.request';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { FriendRequestUseCase } from 'src/application/use-cases/friend/friend-request.use-case';
import { FriendAcceptanceUseCase } from 'src/application/use-cases/friend/friend-acceptance.use-case';
import { AccepFriendRequest } from 'src/presentation/dto/friend/request/accept-friend.request';

@ApiTags('/friends')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsReader,
    private readonly friendWriteService: FriendsWriter,
    private readonly friendRequestUseCase: FriendRequestUseCase,
    private readonly friendAcceptanceUseCase: FriendAcceptanceUseCase,
  ) {}

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
  @Post()
  async request(
    @Body() dto: CreateFriendRequest,
    @CurrentUser() userId: string,
  ) {
    const { userId: receiverId } = dto;
    await this.friendRequestUseCase.execute({ senderId: userId, receiverId });
  }

  @ApiOperation({ summary: '친구 요청 수락' })
  @ApiResponse({
    status: 201,
    description: '친구 요청 수락 완료',
  })
  @Post('accept')
  async accept(@Body() dto: AccepFriendRequest, @CurrentUser() userId: string) {
    await this.friendAcceptanceUseCase.execute({ ...dto, receiverId: userId });
  }

  @ApiOperation({
    summary: '친구 요청 거절',
    description:
      '보낸 요청 취소에도 동일하게 사용하시면 돼요. 기존에는 친구 요청 id 였는데 요청을 보낸 회원 id로 바꼈어요.',
  })
  @ApiResponse({
    status: 201,
    description: '친구 요청 거절 완료',
  })
  @Post('reject')
  async reject(@Body() dto: AccepFriendRequest, @CurrentUser() userId: string) {
    await this.friendWriteService.reject(dto.senderId, userId);
  }

  @ApiOperation({ summary: '친구 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '친구 목록 조회 성공',
    type: FriendListResponse,
  })
  @Get()
  async getFriends(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendListResponse> {
    return await this.friendsService.read(userId, paginationDto);
  }

  @ApiOperation({ summary: '받은 친구 요청 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '받은 친구 요청 목록 조회 성공',
    type: FriendRequestListResponse,
  })
  @Get('requests/received')
  async getReceivedRequests(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendRequestListResponse> {
    return await this.friendsService.readReceivedRequests(
      userId,
      paginationDto,
    );
  }

  @ApiOperation({ summary: '보낸 친구 요청 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '보낸 친구 요청 목록 조회 성공',
    type: FriendRequestListResponse,
  })
  @Get('requests/sent')
  async getSentRequests(
    @Query() paginationDto: UserPaginationRequest,
    @CurrentUser() userId: string,
  ): Promise<FriendRequestListResponse> {
    return await this.friendsService.readSentRequests(userId, paginationDto);
  }

  @ApiOperation({ summary: '친구 검색' })
  @ApiQuery({
    name: 'search',
    description: '계정 아이디 검색어',
    type: 'string',
    example: 'lighty_id',
  })
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: FriendListResponse,
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
    await this.friendWriteService.delete(friendUserId, userId);
  }
}
