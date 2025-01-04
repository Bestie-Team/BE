import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FRIEND_REQUEST_ALREADY_EXIST_MESSAGE } from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { User } from 'src/domain/types/user.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PaginationInput } from 'src/shared/types';

@Injectable()
export class FriendsPrismaRepository implements FriendsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: FriendEntity): Promise<void> {
    try {
      await this.prisma.friend.create({
        data,
      });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException(FRIEND_REQUEST_ALREADY_EXIST_MESSAGE);
        }
        throw e;
      }
      throw e;
    }
  }

  async findOneById(
    id: string,
  ): Promise<{ id: string; receiverId: string } | null> {
    return await this.prisma.friend.findUnique({
      select: {
        id: true,
        receiverId: true,
      },
      where: {
        id,
      },
    });
  }

  async findAllFriendByUserId(
    userId: string,
    paginationInput: PaginationInput,
  ): Promise<User[]> {
    const rows = await this.prisma.$kysely
      .selectFrom('user as u')
      .select(['u.id', 'u.account_id', 'u.name', 'u.profile_image_url'])
      .where('u.id', '!=', userId)
      .where('u.name', '>', paginationInput.cursor)
      .where('u.id', 'in', (qb) =>
        qb
          .selectFrom('friend as f')
          .select('f.receiver_id as user_id')
          .where('f.sender_id', '=', userId)
          .union((qb) =>
            qb
              .selectFrom('friend as f')
              .select('f.sender_id as user_id')
              .where('f.receiver_id', '=', userId),
          ),
      )
      .orderBy('u.name')
      .limit(paginationInput.limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      profileImageUrl: row.profile_image_url,
    }));
  }

  async update(id: string, data: Partial<FriendEntity>): Promise<void> {
    await this.prisma.friend.update({
      data,
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.friend.delete({
      where: {
        id,
      },
    });
  }
}
