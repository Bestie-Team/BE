import { Module } from '@nestjs/common';
import { FriendAcceptanceUseCase } from 'src/application/use-cases/friend/friend-acceptance.use-case';
import { FriendRequestUseCase } from 'src/application/use-cases/friend/friend-request.use-case';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendsWriter } from 'src/domain/services/friend/friends-writer';
import { FriendsService } from 'src/domain/services/friend/friends.service';
import { FriendsPrismaRepository } from 'src/infrastructure/repositories/friend/friends.prisma.repository';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { FriendsController } from 'src/presentation/controllers/friend/friends.controller';

@Module({
  imports: [UsersModule, GatheringParticipationModules, NotificationsModule],
  controllers: [FriendsController],
  providers: [
    FriendRequestUseCase,
    FriendAcceptanceUseCase,
    FriendsWriter,
    FriendsService,
    { provide: FriendsRepository, useClass: FriendsPrismaRepository },
  ],
  exports: [{ provide: FriendsRepository, useClass: FriendsPrismaRepository }],
})
export class FriendsModule {}
