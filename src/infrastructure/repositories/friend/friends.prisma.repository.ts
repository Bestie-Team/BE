import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FRIEND_REQUEST_ALREADY_EXIST } from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

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
          throw new ConflictException(FRIEND_REQUEST_ALREADY_EXIST);
        }
        throw e;
      }
      throw e;
    }
  }

  async update(friendId: string, data: Partial<FriendEntity>): Promise<void> {
    await this.prisma.friend.update({
      data,
      where: { id: friendId },
    });
  }
}
