import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { Gathering, GatheringDetail } from 'src/domain/types/gathering.types';
import { PaginatedDateRangeInput } from 'src/shared/types';

@Injectable()
export class GatheringsPrismaRepository implements GatheringsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: GatheringEntity): Promise<void> {
    await this.txHost.tx.gathering.create({
      data,
    });
  }

  async findByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<Gathering[]> {
    const { cursor, limit, minDate, maxDate } = paginatedDateRangeInput;
    const rows = await this.txHost.tx.$kysely
      .selectFrom('gathering as g')
      .innerJoin('gathering_participation as gp', 'g.id', 'gp.gathering_id')
      .select(['g.id', 'g.name', 'g.gathering_date', 'g.invitation_image_url'])
      .where((eb) =>
        eb.or([
          eb('gp.participant_id', '=', userId),
          eb('g.host_user_id', '=', userId),
        ]),
      )
      .where('g.gathering_date', '>=', new Date(minDate))
      .where('g.gathering_date', '<=', new Date(maxDate))
      .where(
        'g.gathering_date',
        cursor === minDate ? '>=' : '>',
        new Date(cursor),
      )
      .orderBy('g.gathering_date')
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      gatheringDate: row.gathering_date,
      invitationImageUrl: row.invitation_image_url,
    }));
  }

  async findDetailById(id: string): Promise<GatheringDetail | null> {
    const result = await this.txHost.tx.gathering.findUnique({
      select: {
        id: true,
        name: true,
        description: true,
        gatheringDate: true,
        address: true,
        invitationImageUrl: true,
        user: {
          select: {
            id: true,
            accountId: true,
            profileImageUrl: true,
            name: true,
          },
        },
        participations: {
          select: {
            participant: {
              select: {
                id: true,
                accountId: true,
                profileImageUrl: true,
                name: true,
              },
            },
          },
        },
      },
      where: {
        id,
      },
    });

    return result
      ? {
          id: result.id,
          address: result.address,
          description: result.description,
          gatheringDate: result.gatheringDate,
          invitationImageUrl: result.invitationImageUrl,
          name: result.name,
          hostUser: result.user,
          members: result.participations.map((participant) => ({
            ...participant.participant,
          })),
        }
      : null;
  }

  async findOneById(
    id: string,
  ): Promise<{ id: string; endedAt: Date | null } | null> {
    return await this.txHost.tx.gathering.findUnique({
      select: { id: true, endedAt: true },
      where: { id },
    });
  }
}
