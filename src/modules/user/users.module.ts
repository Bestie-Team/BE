import { Module } from '@nestjs/common';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { UsersService } from 'src/domain/services/user/users.service';
import { UsersPrismaRepository } from 'src/infrastructure/repositories/users-prisma.repository';
import { UsersController } from 'src/presentation/controllers/user/users.controller';
@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: UsersRepository, useClass: UsersPrismaRepository },
  ],
  exports: [
    { provide: UsersRepository, useClass: UsersPrismaRepository },
    UsersService,
  ],
})
export class UsersModule {}
