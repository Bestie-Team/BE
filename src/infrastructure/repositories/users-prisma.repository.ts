import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { UserBasicInfo } from 'src/domain/types/user.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: UserEntity): Promise<void> {
    await this.prisma.user.create({
      data,
    });
  }

  async findOneByEmail(email: string): Promise<UserBasicInfo | null> {
    return await this.prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        provider: true,
      },
      where: {
        email,
      },
    });
  }

  async findOneByAccountId(accountId: string): Promise<{ id: string } | null> {
    return await this.prisma.user.findUnique({
      select: {
        id: true,
      },
      where: { accountId },
    });
  }
}
