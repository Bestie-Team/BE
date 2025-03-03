import { Module } from '@nestjs/common';
import { RefreshTokenReader } from 'src/domain/components/token/refresh-token-reader';
import { RefreshTokenWriter } from 'src/domain/components/token/refresh-token-writer';
import { RefreshTokenRepository } from 'src/domain/interface/token/refresh-token.repository';
import { RefreshTokenPrismaRepository } from 'src/infrastructure/repositories/token/refresh-token-prisma.repository';

@Module({
  providers: [
    RefreshTokenReader,
    RefreshTokenWriter,
    { provide: RefreshTokenRepository, useClass: RefreshTokenPrismaRepository },
  ],
  exports: [RefreshTokenReader, RefreshTokenWriter],
})
export class RefreshTokenComponentModule {}
