import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UsersModule } from './modules/user/users.module';
import { validationSchema } from './configs/config-module/validation';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { FiltersModule } from './common/filters/filters.module';
import { PipesModule } from './common/pipes/pipes.module';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringsModule } from 'src/modules/gathering/gatherings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    PrismaModule,
    FiltersModule,
    PipesModule,
    UsersModule,
    AuthModule,
    FriendsModule,
    GatheringsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
