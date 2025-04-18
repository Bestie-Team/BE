import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GroupParticipationStatus } from '@prisma/client';
import { sql } from 'kysely';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { Group, GroupDetail } from 'src/domain/types/group.types';
import { getKyselyUuid } from 'src/infrastructure/prisma/get-kysely-uuid';
import { PaginationInput } from 'src/shared/types';

@Injectable()
export class GroupsPrismaRepository implements GroupsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: GroupEntity): Promise<void> {
    await this.txHost.tx.group.create({
      data,
    });
  }

  async findOneById(id: string): Promise<{ id: string } | null> {
    return await this.txHost.tx.group.findUnique({
      select: { id: true },
      where: { id },
    });
  }

  async findGroupsByUserId(
    userId: string,
    paginationInput: PaginationInput,
  ): Promise<Group[]> {
    const { cursor, limit } = paginationInput;
    const userIdUuid = getKyselyUuid(userId);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('group as g')
      .innerJoin('group_participation as gp', 'g.id', 'gp.group_id')
      .innerJoin('active_user as ou', 'g.owner_id', 'ou.id')
      .leftJoin('active_user as mu', 'gp.participant_id', 'mu.id')
      .select([
        'g.id as group_id',
        'g.name as group_name',
        'g.description',
        'g.gathering_count',
        'g.group_image_url',
        'gp.created_at as join_date',
        'ou.id as owner_id',
        'ou.name as owner_name',
        'ou.account_id as owner_account_id',
        'ou.profile_image_url as owner_profile_image_url',
        'mu.id as member_id',
        'mu.name as member_name',
        'mu.account_id as member_account_id',
        'mu.profile_image_url as member_profile_image_url',
      ])
      .where((eb) =>
        eb('g.id', 'in', (qb) =>
          qb
            .selectFrom('group_participation as gp')
            .innerJoin('group as g', 'g.id', 'gp.group_id')
            .innerJoin('active_user as ou', 'g.owner_id', 'ou.id')
            .select('gp.group_id as id')
            .where('gp.participant_id', '=', userIdUuid)
            .where(
              'gp.status',
              '=',
              sql<GroupParticipationStatus>`${GroupParticipationStatus.ACCEPTED}::"GroupParticipationStatus"`,
            )
            .where('gp.created_at', '<', new Date(cursor))
            .groupBy(['gp.group_id', 'gp.created_at', 'g.name'])
            .orderBy('gp.created_at', 'desc')
            .orderBy('g.name', 'asc')
            .limit(limit),
        ),
      )
      .orderBy('gp.created_at', 'desc')
      .orderBy('g.name', 'asc')
      .execute();

    const result: { [key: string]: Group } = {};

    rows.forEach((row) => {
      if (!result.hasOwnProperty(row.group_id)) {
        result[row.group_id] = {
          id: row.group_id,
          name: row.group_name,
          description: row.description,
          gatheringCount: row.gathering_count,
          groupImageUrl: row.group_image_url,
          joinDate: row.join_date,
          owner: {
            id: row.owner_id,
            accountId: row.owner_account_id,
            name: row.owner_name,
            profileImageUrl: row.owner_profile_image_url,
          },
          members: [],
        };
      }

      // 그룹장은 멤버로 집계 X
      if (
        row.member_id &&
        row.member_account_id &&
        row.member_name &&
        row.member_id !== row.owner_id
      ) {
        const member = {
          id: row.member_id,
          accountId: row.member_account_id,
          name: row.member_name,
          profileImageUrl: row.member_profile_image_url,
        };
        result[row.group_id].members.push(member);
      }
    });

    return Object.values(result);
  }

  async findOneByGroupAndOwnerId(
    groupId: string,
    ownerId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.group.findFirst({
      where: {
        id: groupId,
        ownerId,
      },
    });
  }

  async findDetailById(id: string): Promise<GroupDetail | null> {
    const idUuid = getKyselyUuid(id);

    const rows = await this.txHost.tx.$kysely
      .selectFrom('group as g')
      .innerJoin('group_participation as gp', 'g.id', 'gp.group_id')
      .innerJoin('active_user as ou', 'g.owner_id', 'ou.id')
      .leftJoin('active_user as mu', 'gp.participant_id', 'mu.id')
      .select([
        'g.id as group_id',
        'g.name as group_name',
        'g.description',
        'g.gathering_count',
        'g.group_image_url',
        'gp.created_at as join_date',
        'ou.id as owner_id',
        'ou.name as owner_name',
        'ou.account_id as owner_account_id',
        'ou.profile_image_url as owner_profile_image_url',
        'mu.id as member_id',
        'mu.name as member_name',
        'mu.account_id as member_account_id',
        'mu.profile_image_url as member_profile_image_url',
      ])
      .where('g.id', '=', idUuid)
      .execute();

    if (rows.length === 0) {
      return null;
    }

    const result: { [key: string]: Group } = {};

    rows.forEach((row) => {
      if (!result.hasOwnProperty(row.group_id)) {
        result[row.group_id] = {
          id: row.group_id,
          name: row.group_name,
          description: row.description,
          gatheringCount: row.gathering_count,
          groupImageUrl: row.group_image_url,
          joinDate: row.join_date,
          owner: {
            id: row.owner_id,
            accountId: row.owner_account_id,
            name: row.owner_name,
            profileImageUrl: row.owner_profile_image_url,
          },
          members: [],
        };
      }

      // 그룹장은 멤버로 집계 X
      if (
        row.member_id &&
        row.member_account_id &&
        row.member_name &&
        row.member_id !== row.owner_id
      ) {
        const member = {
          id: row.member_id,
          accountId: row.member_account_id,
          name: row.member_name,
          profileImageUrl: row.member_profile_image_url,
        };
        result[row.group_id].members.push(member);
      }
    });

    return Object.values(result)[0] || null;
  }

  async update(id: string, data: Partial<GroupEntity>): Promise<void> {
    await this.txHost.tx.group.update({
      data,
      where: {
        id,
      },
    });
  }

  async delete(groupId: string): Promise<void> {
    await this.txHost.tx.group.delete({
      where: {
        id: groupId,
      },
    });
  }
}
