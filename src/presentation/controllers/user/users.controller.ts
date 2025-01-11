import {
  Body,
  Controller,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiUserPaginationQuery } from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateProfileImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { UsersService } from 'src/domain/services/user/users.service';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { SearchUserRequest } from 'src/presentation/dto/user/request/search-user.request';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { ChangeProfileImageRequest } from 'src/presentation/dto/user/request/change-profile-image.request';

@ApiTags('/users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '프로필 사진 업로드' })
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
  @ApiUserPaginationQuery()
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: SearchUserResponse,
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  async search(
    @Query() dto: SearchUserRequest,
    @CurrentUser() userId: string,
  ): Promise<SearchUserResponse> {
    const { search, ...paginationInput } = dto;
    return await this.usersService.search(userId, { search, paginationInput });
  }

  @ApiOperation({ summary: '프로필 사진 변경' })
  @ApiResponse({
    status: 204,
    description: '변경 성공',
  })
  @ApiResponse({
    status: 400,
    description: '입력값 검증 실패',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('profile/image')
  async changeProfileImage(
    @Body() dto: ChangeProfileImageRequest,
    @CurrentUser() userId: string,
  ) {
    await this.usersService.updateProfileImage(userId, dto.profileImageUrl);
  }
}
