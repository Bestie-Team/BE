import { Module } from '@nestjs/common';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendWriteService } from 'src/domain/services/friend/friend-write.service';
import { FriendsService } from 'src/domain/services/friend/friends.service';
import { FriendsPrismaRepository } from 'src/infrastructure/repositories/friend/friends.prisma.repository';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { UsersModule } from 'src/modules/user/users.module';
import { FriendsController } from 'src/presentation/controllers/friend/friends.controller';

@Module({
  imports: [UsersModule, GatheringParticipationModules],
  controllers: [FriendsController],
  providers: [
    FriendWriteService,
    FriendsService,
    { provide: FriendsRepository, useClass: FriendsPrismaRepository },
  ],
  exports: [{ provide: FriendsRepository, useClass: FriendsPrismaRepository }],
})
export class FriendsModule {}
