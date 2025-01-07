import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiUserPaginationQuery } from 'src/common/decorators/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateProfileImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { UsersService } from 'src/domain/services/user/users.service';
import { FileRequest } from 'src/presentation/dto/file/request/file.request';
import { SearchUserRequest } from 'src/presentation/dto/user/request/search-user.request';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { UploadImageResponse } from 'src/presentation/dto/file/response/upload-image.response';

@ApiTags('/users')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiBody({ type: FileRequest })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    type: UploadImageResponse,
  })
  @ApiResponse({
    status: 400,
    description: '파일 형식 호환 x, 파일 사이즈 초과',
  })
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', CreateProfileImageMulterOptions()))
  @Post('profile/image')
  uploadProfileImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadImageResponse {
    return UploadImageResponse.create(file.key);
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
}
