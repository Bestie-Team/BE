import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../../domain/interface/users.repository';
import { UserBasicInfo } from '../../domain/types/user.types';

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
