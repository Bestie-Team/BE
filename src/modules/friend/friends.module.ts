import { Module } from '@nestjs/common';
import { FriendAcceptanceUseCase } from 'src/application/use-cases/friend/friend-acceptance.use-case';
import { FriendRequestUseCase } from 'src/application/use-cases/friend/friend-request.use-case';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { FriendsController } from 'src/presentation/controllers/friend/friends.controller';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { FriendsComponentModule } from 'src/modules/friend/friends-componenet.module';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';

@Module({
  imports: [
    UsersComponentModule,
    FriendsComponentModule,
    FriendsCheckerModule,
    GatheringParticipationModules,
    NotificationsModule,
  ],
  controllers: [FriendsController],
  providers: [FriendRequestUseCase, FriendAcceptanceUseCase, FriendsService],
})
export class FriendsModule {}
