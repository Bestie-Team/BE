import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateProfileImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { UsersService } from 'src/domain/services/user/users.service';
import { SearchUserRequest } from 'src/presentation/dto/user/search-user.request';
import { SearchUserResponse } from 'src/presentation/dto/user/search-user.response';
import { UploadProfileImageResponse } from 'src/presentation/dto/user/upload-image.response';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(FileInterceptor('file', CreateProfileImageMulterOptions()))
  @Post('profile/image')
  uploadProfileImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadProfileImageResponse {
    return UploadProfileImageResponse.create(file.key);
  }

  @Get('search')
  async search(
    @Query() dto: SearchUserRequest,
    @CurrentUser() userId: string,
  ): Promise<SearchUserResponse> {
    const { search, ...paginationInput } = dto;
    return await this.usersService.search(userId, { search, paginationInput });
  }
}
