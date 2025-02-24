import { Module } from '@nestjs/common';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendsPrismaRepository } from 'src/infrastructure/repositories/friend/friends.prisma.repository';

@Module({
  providers: [
    FriendsChecker,
    FriendsReader,
    { provide: FriendsRepository, useClass: FriendsPrismaRepository },
  ],
  exports: [FriendsChecker],
})
export class FriendsCheckerModule {}
