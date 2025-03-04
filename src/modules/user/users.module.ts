import { Module } from '@nestjs/common';
import { UsersController } from 'src/presentation/controllers/user/users.controller';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { UsersService } from 'src/domain/services/user/users.service';
@Module({
  imports: [UsersComponentModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
