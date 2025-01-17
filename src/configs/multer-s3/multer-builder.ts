import * as multerS3 from 'multer-s3';
import { Request } from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { v4 } from 'uuid';

dotenv.config();

export const imageMimeTypes = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/webp',
];

export class MulterBuilder {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly allowedMimeTypes: Array<string> = [];

  private resource = '';
  private path = '';

  constructor() {
    this.s3 = new S3Client({
      region: String(process.env.AWS_BUCKET_REGION),
      credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
      },
    });
    this.bucketName = String(process.env.AWS_BUCKEY_NAME);
  }

  allowImageMimeTypes() {
    this.allowedMimeTypes.push(...imageMimeTypes);
    return this;
  }

  setResource(keyword: string) {
    this.resource = keyword;
    return this;
  }

  setPath(path: string) {
    this.path = path;
    return this;
  }

  build() {
    return multerS3({
      s3: this.s3,
      bucket: this.bucketName,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req: Request, file, callback) => {
        let filename: string;
        const splitedFileNames = file.originalname.split('.');
        const extension = splitedFileNames.at(splitedFileNames.length - 1);

        if (this.path) {
          filename = `${this.path}/${v4()}.${extension}`;
        } else {
          filename = `${v4()}.${extension}`;
        }
        return callback(null, encodeURI(`${this.resource}/${filename}`));
      },
    });
  }
}
