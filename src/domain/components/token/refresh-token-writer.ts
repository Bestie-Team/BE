import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/domain/interface/token/refresh-token.repository';

@Injectable()
export class RefreshTokenWriter {
  constructor(
    @Inject(RefreshTokenRepository)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async create(token: RefreshTokenEntity) {
    await this.refreshTokenRepository.save(token);
  }

  async update(userId: string, deviceId: string, token: string) {
    await this.refreshTokenRepository.update(userId, deviceId, token);
  }

  async delete(userId: string, deviceId: string) {
    await this.refreshTokenRepository.delete(userId, deviceId);
  }
}
