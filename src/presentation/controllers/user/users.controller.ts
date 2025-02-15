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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiFileOperation } from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateProfileImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { UsersService } from 'src/domain/services/user/users.service';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { SearchUserRequest } from 'src/presentation/dto/user/request/search-user.request';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { ChangeProfileImageRequest } from 'src/presentation/dto/user/request/change-profile-image.request';
import { ChangeAccountIdRequest } from 'src/presentation/dto';
import { UserDetailResponse } from 'src/presentation/dto/user/response/user-detail.response';
import { UserProfileResponse } from 'src/presentation/dto/user/response/user-profile.response';

@ApiTags('/users')
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    return await this.usersService.search(userId, { search, paginationInput });
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
    return await this.usersService.getDetail(userId);
  }

  @ApiOperation({
    summary: '회원 프로필 조회 (로그인 시 응답하는 회원 정보와 동일)',
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
    return await this.usersService.getProfile(userId);
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
    await this.usersService.updateProfileImage(userId, dto.profileImageUrl);
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
    await this.usersService.updateAccountId(userId, dto.accountId);
  }

  @ApiOperation({
    summary: '탈퇴',
    description:
      '아직 실행은 하면 안 돼여, 삭제 정책 다른 곳에 반영 안 했어요~~',
  })
  @ApiResponse({
    status: 204,
    description: '탈퇴 성공',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async delete(@CurrentUser() userId: string) {
    await this.usersService.delete(userId);
  }
}
