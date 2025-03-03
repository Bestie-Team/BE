import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { RefreshToken } from 'src/domain/types/auth.types';

export interface RefreshTokenRepository {
  save(data: RefreshTokenEntity): Promise<void>;
  findOneByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<RefreshToken | null>;
}

export const RefreshTokenRepository = Symbol('RefreshTokenRepository');
