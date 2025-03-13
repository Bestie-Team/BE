import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SentryModule } from '@sentry/nestjs/setup';
import { ClsModule } from 'nestjs-cls';
import { AppController } from 'src/app.controller';
import { UsersModule } from 'src/modules/user/users.module';
import { validationSchema } from 'src/configs/config-module/validation';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { FiltersModule } from 'src/common/filters/filters.module';
import { PipesModule } from 'src/common/pipes/pipes.module';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringsModule } from 'src/modules/gathering/gatherings.module';
import { clsOptions } from 'src/configs/cls/cls-options';
import { GroupsModule } from 'src/modules/group/groups.module';
import { InterceptorsModule } from 'src/common/interceptors/interceptors.module';
import { FeedsModule } from 'src/modules/feed/feeds.module';
import { FeedCommentsModule } from 'src/modules/feed-comment/feed-comments.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { ReportsModule } from 'src/modules/report/reports.module';
import { ListenersModule } from 'src/infrastructure/event/listeners/listeners.module';
import { WinstonModule } from 'nest-winston';
import { windstonOptions } from 'src/configs/winston/winston-options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    WinstonModule.forRoot(windstonOptions),
    ClsModule.forRoot(clsOptions),
    SentryModule.forRoot(),
    PrismaModule,
    EventEmitterModule.forRoot(),
    ListenersModule,
    FiltersModule,
    InterceptorsModule,
    PipesModule,
    UsersModule,
    AuthModule,
    FriendsModule,
    GatheringsModule,
    GroupsModule,
    FeedsModule,
    FeedCommentsModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
