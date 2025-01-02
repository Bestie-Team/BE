import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../../domain/interface/users.repository';
import { UserBasicInfo } from '../../domain/types/user.types';
import { UserEntity } from '../../domain/entities/user/user.entity';

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
