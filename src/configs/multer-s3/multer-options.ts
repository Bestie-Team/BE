import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { imageMimeTypes, MulterBuilder } from './multer-builder';
import { BadRequestException } from '@nestjs/common';

const fileFilter = (req: any, file: any, cb: any) => {
  const types = imageMimeTypes;
  const mimetype = types.find((im) => im === file.mimetype);
  if (!mimetype) {
    cb(
      new BadRequestException(`${types.join(', ')}만 저장할 수 있습니다.`),
      false,
    );
  }

  return cb(null, true);
};

const CreateMulterOptions = (resource: string, path: string): MulterOptions => {
  return {
    fileFilter,
    storage: new MulterBuilder()
      .allowImageMimeTypes()
      .setResource(resource)
      .setPath(path)
      .build(),
    limits: { fieldSize: 1024 * 1024 * 20 },
  };
};

export const CreateProfileImageMulterOptions = (): MulterOptions => {
  return CreateMulterOptions('user', 'profile');
};

export const CreateGroupCoverImageMulterOptions = (): MulterOptions => {
  return CreateMulterOptions('group', 'cover');
};
