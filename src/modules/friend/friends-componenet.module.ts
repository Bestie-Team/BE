import { Module } from '@nestjs/common';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendsPrismaRepository } from 'src/infrastructure/repositories/friend/friends.prisma.repository';

@Module({
  providers: [
    FriendsWriter,
    FriendsReader,
    { provide: FriendsRepository, useClass: FriendsPrismaRepository },
  ],
  exports: [FriendsWriter, FriendsReader],
})
export class FriendsComponentModule {}
