import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProfileImageMulterOptions } from '../../../configs/multer-s3/multer-options';
import { UploadProfileImageResponse } from '../../dto/user/upload-image.response';
import { AuthGuard } from '../../../common/guards/auth.guard';

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
