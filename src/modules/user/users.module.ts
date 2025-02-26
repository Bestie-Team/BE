import { Module } from '@nestjs/common';
import { UsersController } from 'src/presentation/controllers/user/users.controller';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
@Module({
  imports: [UsersComponentModule],
  controllers: [UsersController],
})
export class UsersModule {}
