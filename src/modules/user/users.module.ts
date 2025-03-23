import { Module } from '@nestjs/common';
import { UsersController } from 'src/presentation/controllers/user/users.controller';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { UsersService } from 'src/domain/services/user/users.service';
import { S3Module } from 'src/infrastructure/aws/s3/s3.module';
import { RefreshTokenComponentModule } from 'src/modules/token/refresh-token-component.module';
@Module({
  imports: [S3Module, UsersComponentModule, RefreshTokenComponentModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
