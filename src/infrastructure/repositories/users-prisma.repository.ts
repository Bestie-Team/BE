import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import type { User, UserBasicInfo } from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';

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

  async findOneById(id: string): Promise<{ id: string } | null> {
    return await this.prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id,
      },
    });
  }

  async findByAccountIdContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<User[]> {
    const { search, paginationInput } = searchInput;
    const { cursor, limit } = paginationInput;
    const rows = await this.prisma.$kysely
      .selectFrom('user as u')
      .select(['u.id', 'u.account_id', 'u.name', 'u.profile_image_url'])
      .where('u.account_id', 'like', `%${search}%`)
      .where('u.id', '!=', userId)
      .where(({ eb, or, and }) =>
        or([
          eb('u.name', '>', cursor.name),
          and([
            eb('u.name', '=', cursor.name),
            eb('u.account_id', '>', cursor.accountId),
          ]),
        ]),
      )
      .where('u.id', 'not in', (qb) =>
        qb
          .selectFrom('friend as f')
          .select('f.sender_id as friend_id')
          .where('f.receiver_id', '=', userId)
          .union((qb) =>
            qb
              .selectFrom('friend as f')
              .select('f.receiver_id as friend_id')
              .where('f.sender_id', '=', userId),
          ),
      )
      .orderBy('u.name')
      .orderBy('u.account_id')
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      profileImageUrl: row.profile_image_url,
    }));
  }

  async update(data: Partial<UserEntity>): Promise<void> {
    const { id, profileImageUrl } = data;
    await this.prisma.user.update({
      data: {
        profileImageUrl,
      },
      where: {
        id,
      },
    });
  }
}
