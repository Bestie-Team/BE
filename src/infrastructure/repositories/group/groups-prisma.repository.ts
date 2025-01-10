import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { Group } from 'src/domain/types/group.types';
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

  async findGroupsByUserId(
    userId: string,
    paginationInput: PaginationInput,
  ): Promise<Group[]> {
    const { cursor, limit } = paginationInput;
    const rows = await this.txHost.tx.$kysely
      .selectFrom('group as g')
      .innerJoin('group_participation as gp', 'g.id', 'gp.group_id')
      .innerJoin('user as mu', 'gp.participant_id', 'mu.id')
      .innerJoin('user as ou', 'g.owner_id', 'ou.id')
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
            .selectFrom('group as g')
            .select('g.id')
            .where('g.id', 'in', (qb) =>
              qb
                .selectFrom('group as g')
                .select('g.id as group_id')
                .where('g.owner_id', '=', userId)
                .union((qb) =>
                  qb
                    .selectFrom('group_participation as gp')
                    .select('gp.group_id')
                    .where('gp.participant_id', '=', userId),
                ),
            )
            .where('gp.created_at', '<', new Date(cursor))
            .orderBy('gp.created_at', 'desc')
            .orderBy('g.name', 'asc')
            .limit(limit),
        ),
      )
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

      const member = {
        id: row.member_id,
        accountId: row.member_account_id,
        name: row.member_name,
        profileImageUrl: row.member_profile_image_url,
      };

      result[row.group_id].members.push(member);
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
}
