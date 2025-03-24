import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ApiFileOperation,
  ApiPresignedUrlOperation,
} from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateProfileImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { SearchUserRequest } from 'src/presentation/dto/user/request/search-user.request';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';
import { BUCKET_IMAGE_PATH, IMAGE_BASE_URL } from 'src/common/constant';
import { ChangeProfileImageRequest } from 'src/presentation/dto/user/request/change-profile-image.request';
import {
  ChangeAccountIdRequest,
  UpdateNotificationTokenRequest,
} from 'src/presentation/dto';
import { UserDetailResponse } from 'src/presentation/dto/user/response/user-detail.response';
import { UserProfileResponse } from 'src/presentation/dto/user/response/user-profile.response';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersService } from 'src/domain/services/user/users.service';
import { S3PresignedManager } from 'src/infrastructure/aws/s3/s3-presigned-manager';
import { PresignedUrlResponse } from 'src/presentation/dto/file/response/presigned-url.response';
import { cookieOptions } from 'src/configs/cookie/refresh-token-cookie.config';
import { WithdrawRequest } from 'src/presentation/dto/user/request/withdraw.request';

@ApiTags('/users')
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersWriter: UsersWriter,
    private readonly usersService: UsersService,
    private readonly usersReader: UsersReader,
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', CreateProfileImageMulterOptions()))
  @Post('profile/image')
  uploadProfileImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadImageResponse {
    return {
      imageUrl: `${IMAGE_BASE_URL}/${file.key}`,
    };
  }

  @ApiBearerAuth()
  @ApiPresignedUrlOperation()
  @UseGuards(AuthGuard)
  @Get('profile/presigned')
  async getPresignedUrl(): Promise<PresignedUrlResponse> {
    return await this.s3PresignedManager.getPresignedUrl(
      BUCKET_IMAGE_PATH.USER,
    );
  }

  @Get('search')
  @ApiOperation({ summary: '회원 검색' })
  @ApiQuery({
    name: 'search',
    description: '검색어 (회원 계정 아이디)',
    example: 'ligh',
  })
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: SearchUserResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async search(
    @Query() dto: SearchUserRequest,
    @CurrentUser() userId: string,
  ): Promise<SearchUserResponse> {
    const { search, ...paginationInput } = dto;
    return await this.usersReader.search(userId, { search, paginationInput });
  }

  @ApiOperation({ summary: '회원 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '회원 상세 정보 조회 완료',
    type: UserDetailResponse,
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 회원 번호',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('my')
  async getDetail(@CurrentUser() userId: string): Promise<UserDetailResponse> {
    return await this.usersReader.readDetail(userId);
  }

  @ApiOperation({
    summary: '회원 프로필 (홈 화면에서 매번 호출하는 정보)',
  })
  @ApiResponse({
    status: 200,
    description: '회원 프로필 조회 완료',
    type: UserProfileResponse,
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 회원 번호',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUser() userId: string,
  ): Promise<UserProfileResponse> {
    return await this.usersReader.readProfile(userId);
  }

  @ApiOperation({
    summary: '닉네임 중복 체크',
    description: '상태 코드로만 판단하시면 됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용 가능한 닉네임',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 닉네임',
  })
  @Get('availability')
  async existAccountId(@Query('accountId') accountId: string) {
    await this.usersService.checkDuplicateAccountId(accountId);
  }

  @ApiOperation({ summary: '프로필 사진 변경' })
  @ApiResponse({
    status: 204,
    description: '변경 성공',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('profile/image')
  async changeProfileImage(
    @Body() dto: ChangeProfileImageRequest,
    @CurrentUser() userId: string,
  ) {
    await this.usersService.changeProfileImage(userId, dto.profileImageUrl);
  }

  @ApiOperation({ summary: '계정 아이디 변경' })
  @ApiResponse({
    status: 204,
    description: '변경 성공',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 계정 아이디',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 회원 번호',
  })
  @ApiResponse({
    status: 422,
    description: '마지막 변경일로부터 30일 미경과',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('account-id')
  async changeAccountId(
    @Body() dto: ChangeAccountIdRequest,
    @CurrentUser() userId: string,
  ) {
    await this.usersService.changeAccountId(userId, dto.accountId);
  }

  @ApiOperation({ summary: '알림 토큰 변경' })
  @ApiResponse({ status: 204, description: '변경 완료' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('notification-token')
  async updateNotificationToken(
    @Body() dto: UpdateNotificationTokenRequest,
    @CurrentUser() userId: string,
  ) {
    await this.usersWriter.updateNotificationToken(dto.token, userId);
  }

  @ApiOperation({ summary: '탈퇴' })
  @ApiResponse({
    status: 204,
    description: '탈퇴 성공',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async withdraw(
    @CurrentUser() userId: string,
    @Body() dto: WithdrawRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authorizationCode } = dto;
    await this.usersService.withdraw(userId, authorizationCode);
    res.clearCookie('refresh_token', cookieOptions);
  }
}
