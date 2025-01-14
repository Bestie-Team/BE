import { FriendRequest } from 'src/domain/types/friend.types';
import {
  Gathering,
  GatheringInvitation,
} from 'src/domain/types/gathering.types';
import { Group } from 'src/domain/types/group.types';
import { User } from 'src/domain/types/user.types';

export const getUserCursor = (users: User[], limit: number) => {
  return users[limit - 1]
    ? {
        name: users[limit - 1].name,
        accountId: users[limit - 1].accountId,
      }
    : null;
};

export const getFriendRequestCursor = (
  friendRequests: FriendRequest[],
  limit: number,
) => {
  return friendRequests[limit - 1]
    ? {
        name: friendRequests[limit - 1].sender.name,
        accountId: friendRequests[limit - 1].sender.accountId,
      }
    : null;
};

export const getGroupCursor = (groups: Group[], limit: number) => {
  return groups[limit - 1]?.joinDate.toISOString() || null;
};

export const getGatheringInvitationCursor = (
  invitations: GatheringInvitation[],
  limit: number,
) => {
  return invitations[limit - 1]?.createdAt.toISOString() || null;
};

export const getGatheringCursor = (invitations: Gathering[], limit: number) => {
  return invitations[limit - 1]?.gatheringDate.toISOString() || null;
};
