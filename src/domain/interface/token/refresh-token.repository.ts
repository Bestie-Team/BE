import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';

export interface RefreshTokenRepository {
  save(data: RefreshTokenEntity): Promise<void>;
}

export const RefreshTokenRepository = Symbol('RefreshTokenRepository');
