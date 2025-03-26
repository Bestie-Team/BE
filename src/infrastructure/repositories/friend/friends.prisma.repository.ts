import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { FriendStatus as PrismaFriendStatus } from '@prisma/client';
import { sql } from 'kysely';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendRequest } from 'src/domain/types/friend.types';
import { User } from 'src/domain/types/user.types';
import { getKyselyUuid } from 'src/infrastructure/prisma/get-kysely-uuid';
import { SearchInput } from 'src/infrastructure/types/user.types';
import { FriendStatus, UserPaginationInput } from 'src/shared/types';

@Injectable()
export class FriendsPrismaRepository implements FriendsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: FriendEntity): Promise<void> {
    await this.txHost.tx.friend.create({
      data,
    });
  }

  async findOneById(
    id: string,
  ): Promise<{ id: string; receiverId: string; senderId: string } | null> {
    return await this.txHost.tx.friend.findUnique({
      select: {
        id: true,
        receiverId: true,
        senderId: true,
      },
      where: {
        id,
      },
    });
  }

  async findFriendsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<User[]> {
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('active_user as u')
      .select(['u.id', 'u.account_id', 'u.name', 'u.profile_image_url'])
      .where('u.id', '!=', userIdUuid)
      .where(({ eb, or, and }) =>
        or([
          eb('u.name', '>', cursor.name),
          and([
            eb('u.name', '=', cursor.name),
            eb('u.account_id', '>', cursor.accountId),
          ]),
        ]),
      )
      .where('u.id', 'in', (qb) =>
        qb
          .selectFrom('friend as f')
          .select('f.receiver_id as user_id')
          .where('f.sender_id', '=', userIdUuid)
          .where(
            'f.status',
            '=',
            sql<PrismaFriendStatus>`${PrismaFriendStatus.ACCEPTED}::"FriendStatus"`,
          )
          .union((qb) =>
            qb
              .selectFrom('friend as f')
              .select('f.sender_id as user_id')
              .where('f.receiver_id', '=', userIdUuid)
              .where(
                'f.status',
                '=',
                sql<PrismaFriendStatus>`${PrismaFriendStatus.ACCEPTED}::"FriendStatus"`,
              ),
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

  // NOTE 현재 사용 X, 사용 시 쿼리 수정 필요.
  async findFriendsByAccountIdAndNameContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<User[]> {
    const { search, paginationInput } = searchInput;
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('active_user as u')
      .select(['u.id', 'u.account_id', 'u.name', 'u.profile_image_url'])
      .where('u.id', '!=', userIdUuid)
      .where(({ eb, or, and }) =>
        or([
          eb('u.name', '>', cursor.name),
          and([
            eb('u.name', '=', cursor.name),
            eb('u.account_id', '>', cursor.accountId),
          ]),
        ]),
      )
      .where('u.id', 'in', (qb) =>
        qb
          .selectFrom('friend as f')
          .select('f.receiver_id as user_id')
          .where('f.sender_id', '=', userIdUuid)
          .where(
            'f.status',
            '=',
            sql<PrismaFriendStatus>`${PrismaFriendStatus.ACCEPTED}::"FriendStatus"`,
          )
          .union((qb) =>
            qb
              .selectFrom('friend as f')
              .select('f.sender_id as user_id')
              .where('f.receiver_id', '=', userIdUuid)
              .where(
                'f.status',
                '=',
                sql<PrismaFriendStatus>`${PrismaFriendStatus.ACCEPTED}::"FriendStatus"`,
              ),
          ),
      )
      .where(({ eb, or }) =>
        or([
          eb('u.name', 'like', `%${search}%`),
          eb('u.account_id', 'like', `%${search}%`),
        ]),
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

  async findReceivedRequestsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<FriendRequest[]> {
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('friend as f')
      .innerJoin('active_user as u', 'f.sender_id', 'u.id')
      .select([
        'f.id',
        'u.id as user_id',
        'u.account_id',
        'u.name',
        'u.profile_image_url',
      ])
      .where('f.receiver_id', '=', userIdUuid)
      .where(
        'f.status',
        '=',
        sql<PrismaFriendStatus>`${PrismaFriendStatus.PENDING}::"FriendStatus"`,
      )
      .where(({ eb, or, and }) =>
        or([
          eb('u.name', '>', cursor.name),
          and([
            eb('u.name', '=', cursor.name),
            eb('u.account_id', '>', cursor.accountId),
          ]),
        ]),
      )
      .orderBy('u.name')
      .orderBy('u.account_id')
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      sender: {
        id: row.user_id,
        accountId: row.account_id,
        name: row.name,
        profileImageUrl: row.profile_image_url,
      },
    }));
  }

  async findSentRequestsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<FriendRequest[]> {
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('friend as f')
      .innerJoin('active_user as u', 'f.receiver_id', 'u.id')
      .select([
        'f.id',
        'u.id as user_id',
        'u.account_id',
        'u.name',
        'u.profile_image_url',
      ])
      .where('f.sender_id', '=', userIdUuid)
      .where(
        'f.status',
        '=',
        sql<PrismaFriendStatus>`${PrismaFriendStatus.PENDING}::"FriendStatus"`,
      )
      .where(({ eb, or, and }) =>
        or([
          eb('u.name', '>', cursor.name),
          and([
            eb('u.name', '=', cursor.name),
            eb('u.account_id', '>', cursor.accountId),
          ]),
        ]),
      )
      .orderBy('u.name')
      .orderBy('u.account_id')
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      sender: {
        id: row.user_id,
        accountId: row.account_id,
        name: row.name,
        profileImageUrl: row.profile_image_url,
      },
    }));
  }

  async findOneBySenderAndReceiverId(
    firstUserId: string,
    secondUserId: string,
  ): Promise<{
    id: string;
    status: FriendStatus;
    senderId: string;
    receiverId: string;
  } | null> {
    return await this.txHost.tx.friend.findFirst({
      select: { id: true, status: true, senderId: true, receiverId: true },
      where: {
        OR: [
          {
            AND: [{ senderId: firstUserId }, { receiverId: secondUserId }],
          },
          {
            AND: [{ senderId: secondUserId }, { receiverId: firstUserId }],
          },
        ],
      },
    });
  }

  async findOneFriendByUserId(
    senderOrReceiverId: string,
  ): Promise<{ senderId: string; receiverId: string } | null> {
    return await this.txHost.tx.friend.findFirst({
      select: { senderId: true, receiverId: true },
      where: {
        OR: [
          { senderId: senderOrReceiverId },
          { receiverId: senderOrReceiverId },
        ],
      },
    });
  }

  async countRequest(userId: string): Promise<number> {
    return await this.txHost.tx.friend.count({
      where: {
        status: 'PENDING',
        OR: [
          {
            AND: [{ senderId: userId }, { receiver: { deletedAt: null } }],
          },
          {
            AND: [{ receiverId: userId }, { sender: { deletedAt: null } }],
          },
        ],
      },
    });
  }

  async update(
    senderId: string,
    receiverId: string,
    data: Partial<FriendEntity>,
  ): Promise<void> {
    await this.txHost.tx.friend.updateMany({
      data,
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
  }

  async delete(senderId: string, receiverId: string): Promise<void> {
    await this.txHost.tx.friend.deleteMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
  }

  async updateById(id: string, data: Partial<FriendEntity>): Promise<void> {
    await this.txHost.tx.friend.update({
      data,
      where: { id },
    });
  }

  async deleteByUserIds(
    firstUserId: string,
    secondUserId: string,
  ): Promise<void> {
    await this.txHost.tx.friend.deleteMany({
      where: {
        OR: [
          {
            AND: [{ senderId: firstUserId }, { receiverId: secondUserId }],
          },
          {
            AND: [{ senderId: secondUserId }, { receiverId: firstUserId }],
          },
        ],
      },
    });
  }
}
