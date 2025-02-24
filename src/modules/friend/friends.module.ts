import { Module } from '@nestjs/common';
import { FriendAcceptanceUseCase } from 'src/application/use-cases/friend/friend-acceptance.use-case';
import { FriendRequestUseCase } from 'src/application/use-cases/friend/friend-request.use-case';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { FriendsPrismaRepository } from 'src/infrastructure/repositories/friend/friends.prisma.repository';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { FriendsController } from 'src/presentation/controllers/friend/friends.controller';
import { FriendsService } from 'src/domain/services/friends/friends.service';

@Module({
  imports: [UsersModule, GatheringParticipationModules, NotificationsModule],
  controllers: [FriendsController],
  providers: [
    FriendRequestUseCase,
    FriendAcceptanceUseCase,
    FriendsWriter,
    FriendsReader,
    FriendsService,
    { provide: FriendsRepository, useClass: FriendsPrismaRepository },
  ],
  exports: [FriendsWriter, FriendsReader],
})
export class FriendsModule {}
