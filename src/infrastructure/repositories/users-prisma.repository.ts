import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../domain/interface/users.repository';
import { Provider } from '../../shared/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<{
    email: string;
    provider: Provider;
  } | null> {
    return await this.prisma.user.findUnique({
      select: {
        email: true,
        provider: true,
      },
      where: {
        email,
      },
    });
  }
}
