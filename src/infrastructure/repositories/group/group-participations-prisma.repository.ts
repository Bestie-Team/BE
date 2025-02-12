import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { NOT_FOUND_GROUP } from 'src/domain/error/messages';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupParticipationStatus } from 'src/shared/types';

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

  async saveMany(data: GroupParticipationEntity[]): Promise<void> {
    await this.txHost.tx.groupParticipation.createMany({
      data,
    });
  }

  async findByUserIds(
    userIds: string[],
  ): Promise<{ id: string; status: GroupParticipationStatus }[]> {
    return await this.txHost.tx.groupParticipation.findMany({
      select: {
        id: true,
        status: true,
      },
      where: {
        participantId: {
          in: userIds,
        },
      },
    });
  }

  async findMembersByGroupId(
    groupId: string,
  ): Promise<{ participantId: string }[]> {
    return await this.txHost.tx.groupParticipation.findMany({
      select: {
        participantId: true,
      },
      where: {
        groupId,
      },
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

  async update(
    id: string,
    data: Partial<GroupParticipationEntity>,
  ): Promise<void> {
    try {
      await this.txHost.tx.groupParticipation.update({
        data,
        where: {
          id,
        },
      });
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(NOT_FOUND_GROUP);
      }
      throw e;
    }
  }
}
