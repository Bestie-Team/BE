import { Module } from '@nestjs/common';
import { RefreshTokenRepository } from 'src/domain/interface/token/refresh-token.repository';
import { RefreshTokenPrismaRepository } from 'src/infrastructure/repositories/token/refresh-token-prisma.repository';

@Module({
  providers: [
    { provide: RefreshTokenRepository, useClass: RefreshTokenPrismaRepository },
  ],
})
export class RefreshTokenComponentModule {}
