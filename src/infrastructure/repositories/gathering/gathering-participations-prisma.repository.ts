import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationStatus } from '@prisma/client';
import { sql } from 'kysely';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringInvitation } from 'src/domain/types/gathering.types';
import {
  GatheringParticipationStatus as SharedGatheringParticipationStatus,
  PaginationInput,
} from 'src/shared/types';

@Injectable()
export class GatheringParticipationsPrismaRepository
  implements GatheringParticipationsRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: GatheringParticipationEntity): Promise<void> {
    await this.txHost.tx.gatheringParticipation.create({
      data,
    });
  }

  async findOneByIdAndParticipantId(
    id: string,
    participantId: string,
  ): Promise<{ id: string } | null> {
    return await this.txHost.tx.gatheringParticipation.findFirst({
      where: {
        id,
        participantId,
      },
    });
  }

  async findReceivedByParticipantId(
    participantId: string,
    paginationInput: PaginationInput,
  ): Promise<GatheringInvitation[]> {
    const { cursor, limit } = paginationInput;
    const participationRows = await this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('gathering as g', 'gp.gathering_id', 'g.id')
      .innerJoin('user as hu', 'g.host_user_id', 'hu.id')
      .select([
        'gp.id',
        'g.id as gathering_id',
        'g.name',
        'g.description',
        'gp.created_at',
        'g.gathering_date',
        'g.address',
        'hu.account_id as sender',
      ])
      .where('gp.participant_id', '=', participantId)
      .where('gp.created_at', '<', new Date(cursor))
      .where(
        'gp.status',
        '=',
        sql<GatheringParticipationStatus>`${GatheringParticipationStatus.PENDING}::"GatheringParticipationStatus"`,
      )
      .orderBy('gp.created_at', 'desc')
      .limit(limit)
      .execute();

    const gatheringIds = participationRows.map((row) => row.gathering_id);
    const memberRows = await this.txHost.tx.$kysely
      .selectFrom('gathering_participation as gp')
      .innerJoin('user as mu', 'gp.participant_id', 'mu.id')
      .select([
        'gp.gathering_id',
        'mu.id',
        'mu.account_id',
        'mu.name',
        'mu.profile_image_url',
      ])
      .where('gp.gathering_id', 'in', gatheringIds)
      .where('mu.id', '!=', participantId)
      .execute();
    const result: { [key: string]: GatheringInvitation } = {};

    participationRows.forEach((row) => {
      result[row.gathering_id] = {
        id: row.id,
        address: row.address,
        createdAt: row.created_at,
        description: row.description,
        gatheringDate: row.gathering_date,
        name: row.name,
        sender: row.sender,
        members: [],
      };
    });
    memberRows.forEach((member) => {
      result[member.gathering_id].members.push({
        id: member.id,
        accountId: member.account_id,
        name: member.name,
        profileImageUrl: member.profile_image_url,
      });
    });

    return Object.values(result);
  }

  async updateStatus(
    invitationId: string,
    status: SharedGatheringParticipationStatus,
  ): Promise<void> {
    await this.txHost.tx.gatheringParticipation.update({
      data: {
        status,
      },
      where: {
        id: invitationId,
      },
    });
  }

  async delete(invitationId: string): Promise<void> {
    await this.txHost.tx.gatheringParticipation.delete({
      where: {
        id: invitationId,
      },
    });
  }
}
