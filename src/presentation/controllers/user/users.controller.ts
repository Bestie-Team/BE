import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateProfileImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { UploadProfileImageResponse } from 'src/presentation/dto/user/upload-image.response';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  @UseInterceptors(FileInterceptor('file', CreateProfileImageMulterOptions()))
  @Post('profile/image')
  uploadProfileImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadProfileImageResponse {
    return UploadProfileImageResponse.create(file.key);
  }
}
