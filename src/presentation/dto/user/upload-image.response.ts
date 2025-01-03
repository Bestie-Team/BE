import { IMAGE_BASE_URL } from 'src/common/constant';
export class UploadProfileImageResponse {
  readonly imageUrl: string;

  constructor(imagePath: string) {
    this.imageUrl = `${IMAGE_BASE_URL}/${imagePath}`;
  }

  static create(imagePath: string) {
    return new UploadProfileImageResponse(imagePath);
  }
}
