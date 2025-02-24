import { Injectable } from '@nestjs/common';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendsWriter: FriendsWriter,
    private readonly gatheringParticipationWriter: GatheringInvitationsWriter,
  ) {}

  async delete(friendUserId: string, userId: string) {
    await this.friendsWriter.checkExistAcceptedFriend(friendUserId, userId);
    await this.deleteTransaction(friendUserId, userId);
  }

  async deleteTransaction(friendUserId: string, userId: string) {
    await this.friendsWriter.delete(friendUserId, userId);
    await this.gatheringParticipationWriter.deletePending(friendUserId, userId);
  }
}
