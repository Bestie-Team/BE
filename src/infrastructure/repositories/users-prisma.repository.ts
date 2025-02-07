import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import type {
  Profile,
  SearchedUser,
  UserBasicInfo,
  UserDetail,
} from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';
import { sql } from 'kysely';
import { FriendStatus } from '@prisma/client';
import { FriendRequestStatus } from 'src/shared/types';

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
        accountId: true,
        profileImageUrl: true,
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

  async findOneById(
    id: string,
  ): Promise<{ id: string; createdAt: Date; updatedAt: Date } | null> {
    return await this.prisma.user.findUnique({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id,
      },
    });
  }

  async findByAccountIdContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<SearchedUser[]> {
    const { search, paginationInput } = searchInput;
    const { cursor, limit } = paginationInput;
    const rows = await this.prisma.$kysely
      .selectFrom('user as u')
      .leftJoin('friend as f', (join) =>
        join
          .on((eb) =>
            eb.or([
              eb.and([
                eb('f.sender_id', '=', userId),
                eb('f.receiver_id', '=', eb.ref('u.id')),
              ]),
              eb.and([
                eb('f.receiver_id', '=', userId),
                eb('f.sender_id', '=', eb.ref('u.id')),
              ]),
            ]),
          )
          .on(
            'f.status',
            '=',
            sql<FriendStatus>`${FriendStatus.PENDING}::"FriendStatus"`,
          ),
      )
      .select([
        'u.id',
        'u.account_id',
        'u.name',
        'u.profile_image_url',
        sql<string>`CASE
        WHEN f.sender_id = ${userId} THEN 'SENT'
        WHEN f.receiver_id = ${userId} THEN 'RECEIVED'
        ELSE 'NONE'
      END`.as('status'), // 요청 상태 추가
      ])
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
          .where(
            'f.status',
            '=',
            sql<FriendStatus>`${FriendStatus.ACCEPTED}::"FriendStatus"`,
          )
          .union((qb) =>
            qb
              .selectFrom('friend as f')
              .select('f.receiver_id as friend_id')
              .where('f.sender_id', '=', userId)
              .where(
                'f.status',
                '=',
                sql<FriendStatus>`${FriendStatus.ACCEPTED}::"FriendStatus"`,
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
      status: row.status as FriendRequestStatus, // sql case when 사용함.
    }));
  }

  async findDetailById(id: string): Promise<UserDetail | null> {
    const row = await this.prisma.$kysely
      .selectFrom('user as u')
      .select(['u.id', 'u.account_id', 'u.name', 'u.profile_image_url'])
      .select((qb) =>
        qb
          .selectFrom('friend as f')
          .where((eb) =>
            eb.or([eb('f.sender_id', '=', id), eb('f.receiver_id', '=', id)]),
          )
          .where(
            'f.status',
            '=',
            sql<FriendStatus>`${FriendStatus.ACCEPTED}::"FriendStatus"`,
          )
          .select(({ fn }) => fn.countAll().as('friend_count'))
          .as('friend_count'),
      )
      .select((qb) =>
        qb
          .selectFrom('feed as f')
          .where((eb) =>
            eb.and([
              eb('f.writer_id', '=', id),
              eb('f.deleted_at', 'is', null),
            ]),
          )
          .select(({ fn }) => fn.countAll().as('feed_count'))
          .as('feed_count'),
      )
      .select((qb) =>
        qb
          .selectFrom('group as g')
          .leftJoin('group_participation as gp', 'gp.group_id', 'g.id')
          .where((eb) =>
            eb.or([
              eb('g.owner_id', '=', id),
              eb('gp.participant_id', '=', id),
            ]),
          )
          .select(({ fn }) => fn.countAll().as('group_count'))
          .as('group_count'),
      )
      .where('u.id', '=', id)
      .executeTakeFirst();

    return row
      ? {
          id: row.id,
          accountId: row.account_id,
          feedCount: Number(row.feed_count ?? 0),
          friendCount: Number(row.friend_count ?? 0),
          groupCount: Number(row.group_count ?? 0),
          name: row.name,
          profileImageUrl: row.profile_image_url,
        }
      : null;
  }

  async findProfileById(id: string): Promise<Profile | null> {
    return await this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        accountId: true,
        profileImageUrl: true,
      },
      where: {
        id,
      },
    });
  }

  async update(data: Partial<UserEntity>): Promise<void> {
    const { id, ...updateDate } = data;
    await this.prisma.user.update({
      data: updateDate,
      where: {
        id,
      },
    });
  }
}
