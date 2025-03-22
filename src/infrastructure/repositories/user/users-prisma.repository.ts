import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UsersRepository } from 'src/domain/interface/user/users.repository';
import type {
  DeletedUser,
  Profile,
  SearchedUser,
  User,
  UserForLogin,
  UserDetail,
} from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';
import { sql } from 'kysely';
import {
  FriendStatus,
  GatheringParticipationStatus,
  GroupParticipationStatus,
} from '@prisma/client';
import { FriendRequestStatus } from 'src/shared/types';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { getKyselyUuid } from 'src/infrastructure/prisma/get-kysely-uuid';

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: UserEntity): Promise<void> {
    await this.txHost.tx.user.create({
      data,
    });
  }

  async findOneByEmail(email: string): Promise<UserForLogin | null> {
    return await this.txHost.tx.user.findFirst({
      select: {
        id: true,
        email: true,
        accountId: true,
        profileImageUrl: true,
        provider: true,
        deletedAt: true,
      },
      where: {
        email,
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });
  }

  async findOneByAccountId(
    accountId: string,
  ): Promise<{ id: string; deletedAt: Date | null } | null> {
    return await this.txHost.tx.user.findFirst({
      select: {
        id: true,
        deletedAt: true,
      },
      where: {
        accountId,
      },
    });
  }

  async findOneById(id: string): Promise<
    | (User & {
        serviceNotificationConsent: boolean;
        marketingNotificationConsent: boolean;
        notificationToken: string | null;
        createdAt: Date;
        updatedAt: Date;
      })
    | null
  > {
    return await this.txHost.tx.user.findUnique({
      select: {
        id: true,
        name: true,
        accountId: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        serviceNotificationConsent: true,
        marketingNotificationConsent: true,
        notificationToken: true,
      },
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findUsersByIds(ids: string[]): Promise<
    (User & {
      serviceNotificationConsent: boolean;
      marketingNotificationConsent: boolean;
      notificationToken: string | null;
      createdAt: Date;
      updatedAt: Date;
    })[]
  > {
    return await this.txHost.tx.user.findMany({
      select: {
        id: true,
        name: true,
        accountId: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        serviceNotificationConsent: true,
        marketingNotificationConsent: true,
        notificationToken: true,
      },
      where: {
        deletedAt: null,
        id: {
          in: ids,
        },
      },
    });
  }

  async findByAccountIdContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<SearchedUser[]> {
    const { search, paginationInput } = searchInput;
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('active_user as u')
      .leftJoin('friend as f', (join) =>
        join
          .on((eb) =>
            eb.or([
              eb.and([
                eb('f.sender_id', '=', userIdUuid),
                eb('f.receiver_id', '=', eb.ref('u.id')),
              ]),
              eb.and([
                eb('f.receiver_id', '=', userIdUuid),
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
        WHEN f.sender_id = ${getKyselyUuid(userId)} THEN 'SENT'
        WHEN f.receiver_id = ${getKyselyUuid(userId)} THEN 'RECEIVED'
        ELSE 'NONE'
      END`.as('status'), // 요청 상태 추가
      ])
      .where('u.account_id', 'like', `%${search}%`)
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
      .where('u.id', 'not in', (qb) =>
        qb
          .selectFrom('friend as f')
          .select('f.sender_id as friend_id')
          .where('f.receiver_id', '=', userIdUuid)
          .where(
            'f.status',
            '=',
            sql<FriendStatus>`${FriendStatus.ACCEPTED}::"FriendStatus"`,
          )
          .union((qb) =>
            qb
              .selectFrom('friend as f')
              .select('f.receiver_id as friend_id')
              .where('f.sender_id', '=', userIdUuid)
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
    const idUuid = getKyselyUuid(id);

    const row = await this.txHost.tx.$kysely
      .selectFrom('active_user as u')
      .select([
        'u.id',
        'u.account_id',
        'u.name',
        'u.profile_image_url',
        'u.email',
        'u.provider',
      ])
      .select((qb) =>
        qb
          .selectFrom('friend as f')
          .innerJoin('active_user as sender', 'f.sender_id', 'sender.id')
          .innerJoin('active_user as receiver', 'f.receiver_id', 'receiver.id')
          .where((eb) =>
            eb.or([
              eb('f.sender_id', '=', idUuid),
              eb('f.receiver_id', '=', idUuid),
            ]),
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
          .selectFrom('active_feed as f')
          .where('f.writer_id', '=', idUuid)
          .select(({ fn }) => fn.countAll().as('feed_count'))
          .as('feed_count'),
      )
      .select((qb) =>
        qb
          .selectFrom('group_participation as gp')
          .innerJoin('group as g', 'gp.group_id', 'g.id')
          .innerJoin('active_user as u', 'g.owner_id', 'u.id')
          .where('gp.participant_id', '=', idUuid)
          .where(
            'gp.status',
            '=',
            sql<GroupParticipationStatus>`${GroupParticipationStatus.ACCEPTED}::"GroupParticipationStatus"`,
          )
          .select(({ fn }) => fn.countAll().as('group_count'))
          .as('group_count'),
      )
      .where('u.id', '=', idUuid)
      .executeTakeFirst();

    return row
      ? {
          id: row.id,
          accountId: row.account_id,
          feedCount: Number(row.feed_count || 0),
          friendCount: Number(row.friend_count || 0),
          groupCount: Number(row.group_count || 0),
          name: row.name,
          email: row.email,
          provider: row.provider,
          profileImageUrl: row.profile_image_url,
        }
      : null;
  }

  async findProfileById(id: string): Promise<Profile | null> {
    const idUuid = getKyselyUuid(id);

    const row = await this.txHost.tx.$kysely
      .selectFrom('active_user as u')
      .select([
        'u.id',
        'u.account_id',
        'u.email',
        'u.provider',
        'u.name',
        'u.profile_image_url',
      ])
      .select((qb) =>
        qb
          .selectFrom('gathering_participation as gp')
          .where('gp.participant_id', '=', idUuid)
          .where('gp.read_at', 'is', null)
          .where(
            'gp.status',
            '=',
            sql<GatheringParticipationStatus>`${GatheringParticipationStatus.PENDING}::"GatheringParticipationStatus"`,
          )
          .select(({ fn }) => fn.countAll().as('new_invitation_count'))
          .as('new_invitation_count'),
      )
      .select((qb) =>
        qb
          .selectFrom('notification as n')
          .where('n.user_id', '=', idUuid)
          .where('n.read_at', 'is', null)
          .select(({ fn }) => fn.countAll().as('new_notification_count'))
          .as('new_notification_count'),
      )
      .select(() =>
        sql<boolean>`EXISTS (
          SELECT 1
          FROM active_feed as f
          WHERE f.writer_id = ${idUuid}
        )`.as('has_feed'),
      )
      .where('u.id', '=', idUuid)
      .executeTakeFirst();

    return row
      ? {
          id: row.id,
          accountId: row.account_id,
          email: row.email,
          provider: row.provider,
          name: row.name,
          profileImageUrl: row.profile_image_url,
          newNotificationCount: Number(row.new_notification_count || 0),
          newInvitationCount: Number(row.new_invitation_count || 0),
          hasFeed: row.has_feed,
        }
      : null;
  }

  async findDeletedByEmail(email: string): Promise<DeletedUser | null> {
    return await this.txHost.tx.user.findFirst({
      select: {
        id: true,
        accountId: true,
        name: true,
        email: true,
        profileImageUrl: true,
        provider: true,
        deletedAt: true,
      },
      where: {
        email,
        NOT: [{ deletedAt: null }],
      },
    });
  }

  async update(data: Partial<UserEntity>): Promise<void> {
    const { id, ...updateData } = data;
    await this.txHost.tx.user.update({
      data: updateData,
      where: {
        id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.txHost.tx.user.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id,
      },
    });
  }
}
