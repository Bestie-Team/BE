import { Module } from '@nestjs/common';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { UsersPrismaRepository } from 'src/infrastructure/repositories/users-prisma.repository';

@Module({
  providers: [
    UsersReader,
    UsersWriter,
    { provide: UsersRepository, useClass: UsersPrismaRepository },
  ],
  exports: [UsersReader, UsersWriter],
})
export class UsersComponentModule {}
