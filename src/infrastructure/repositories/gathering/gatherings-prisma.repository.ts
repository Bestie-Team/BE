import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';

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
}
