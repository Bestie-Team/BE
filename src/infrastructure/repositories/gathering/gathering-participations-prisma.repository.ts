import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringParticipationStatues } from 'src/shared/types';

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

  async updateStatus(
    invitationId: string,
    status: GatheringParticipationStatues,
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
