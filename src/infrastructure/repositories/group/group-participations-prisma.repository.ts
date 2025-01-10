import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';

@Injectable()
export class GroupParticipationsPrismaRepository
  implements GroupParticipationsRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: GroupParticipationEntity): Promise<void> {
    await this.txHost.tx.groupParticipation.create({
      data,
    });
  }

  async delete(groupId: string, participantId: string): Promise<void> {
    await this.txHost.tx.groupParticipation.delete({
      where: {
        groupId_participantId: {
          groupId,
          participantId,
        },
      },
    });
  }
}
