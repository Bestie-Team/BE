import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { BlockedUserEntity } from 'src/domain/entities/user/blocked-user.entity';
import { BlockedUsersRepository } from 'src/domain/interface/user/blocked-users.repository';

@Injectable()
export class BlockedUsersPrismaRepository implements BlockedUsersRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async save(data: BlockedUserEntity): Promise<void> {
    await this.txHost.tx.blockedUser.create({
      data,
    });
  }
}
