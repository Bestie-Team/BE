import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/domain/interface/token/refresh-token.repository';
import { RefreshToken } from 'src/domain/types/auth.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: RefreshTokenEntity): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }

  async findOneByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findUnique({
      select: {
        userId: true,
        deviceId: true,
        token: true,
        createdAt: true,
      },
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });
  }

  async update(userId: string, deviceId: string, token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      data: {
        token,
      },
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });
  }
}
