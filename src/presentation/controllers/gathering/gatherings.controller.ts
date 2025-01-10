import {
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IMAGE_BASE_URL } from 'src/common/constant';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateGatheringInvitationImageMulterOptions } from 'src/configs/multer-s3/multer-options';
import { GatheringsService } from 'src/domain/services/gathering/gatherings.service';
import { FileRequest, UploadImageResponse } from 'src/presentation/dto';

@ApiTags('/gathering')
@UseGuards(AuthGuard)
@Controller('gatherings')
export class GatheringsController {
  constructor(private readonly gatheringsService: GatheringsService) {}

  @ApiOperation({ summary: '모임 초대장 이미지 업로드' })
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
  @UseInterceptors(
    FileInterceptor('file', CreateGatheringInvitationImageMulterOptions()),
  )
  @Post('invitation/image')
  uploadInvitationImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadImageResponse {
    return {
      imageUrl: `${IMAGE_BASE_URL}/${file.key}`,
    };
  }
}
