import { Module } from '@nestjs/common';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { UsersPrismaRepository } from 'src/infrastructure/repositories/users-prisma.repository';
import { UsersController } from 'src/presentation/controllers/user/users.controller';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';
@Module({
  controllers: [UsersController],
  providers: [
    UsersReader,
    UsersWriter,
    { provide: UsersRepository, useClass: UsersPrismaRepository },
  ],
  exports: [
    { provide: UsersRepository, useClass: UsersPrismaRepository },
    UsersReader,
    UsersWriter,
  ],
})
export class UsersModule {}
