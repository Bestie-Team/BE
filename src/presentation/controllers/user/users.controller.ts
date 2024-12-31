import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CreateProfileImageMulterOptions } from '../../../configs/multer-s3/multer-options';
import { UploadProfileImageResponse } from '../../dto/user/upload-image.response';

@Controller('users')
export class UsersController {
  constructor(private readonly config: ConfigService) {}
  @UseInterceptors(FileInterceptor('file', CreateProfileImageMulterOptions()))
  @Post('profile/image')
  uploadProfileImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadProfileImageResponse {
    return {
      imageUrl: `${this.config.get<string>('CDN_PREFIX')}/${file.key}`,
    };
  }
}
