import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from 'src/domain/interface/token/refresh-token.repository';

@Injectable()
export class RefreshTokenReader {
  constructor(
    @Inject(RefreshTokenRepository)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async readOne(userId: string, deviceId: string) {
    return await this.refreshTokenRepository.findOneByUserIdAndDeviceId(
      userId,
      deviceId,
    );
  }
}
