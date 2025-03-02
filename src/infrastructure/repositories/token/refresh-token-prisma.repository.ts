import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/domain/interface/token/refresh-token.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: RefreshTokenEntity): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }
}
