import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { UsersModule } from 'src/modules/user/users.module';
import { validationSchema } from 'src/configs/config-module/validation';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { FiltersModule } from 'src/common/filters/filters.module';
import { PipesModule } from 'src/common/pipes/pipes.module';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringsModule } from 'src/modules/gathering/gatherings.module';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    ClsModule.forRoot(clsOptions),
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
