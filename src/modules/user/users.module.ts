import { Module } from '@nestjs/common';
import { UsersController } from 'src/presentation/controllers/user/users.controller';
@Module({
  controllers: [UsersController],
})
export class UsersModule {}
