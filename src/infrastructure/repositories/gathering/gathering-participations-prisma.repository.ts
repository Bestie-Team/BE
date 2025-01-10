import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';

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
}
