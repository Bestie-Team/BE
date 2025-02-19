import { Feed } from 'src/domain/types/feed.types';
import { FriendRequest } from 'src/domain/types/friend.types';
import {
  Gathering,
  ReceivedGatheringInvitation,
  SentGatheringInvitation,
} from 'src/domain/types/gathering.types';
import { Group } from 'src/domain/types/group.types';
import { Notification } from 'src/domain/types/notification.types';
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

export const getSentGatheringInvitationCursor = (
  invitations: SentGatheringInvitation[],
  limit: number,
) => {
  return invitations[limit - 1]
    ? {
        createdAt: invitations[limit - 1].createdAt.toISOString(),
        id: invitations[limit - 1].gatheringId,
      }
    : null;
};

export const getReceivedGatheringInvitationCursor = (
  invitations: ReceivedGatheringInvitation[],
  limit: number,
) => {
  return invitations[limit - 1]
    ? {
        createdAt: invitations[limit - 1].createdAt.toISOString(),
        id: invitations[limit - 1].id,
      }
    : null;
};

export const getGatheringCursor = (invitations: Gathering[], limit: number) => {
  return invitations[limit - 1]
    ? {
        createdAt: invitations[limit - 1].gatheringDate.toISOString(),
        id: invitations[limit - 1].id,
      }
    : null;
};

export const getFeedCursor = (feeds: Feed[], limit: number) => {
  return feeds[limit - 1]
    ? {
        createdAt: feeds[limit - 1].createdAt.toISOString(),
        id: feeds[limit - 1].id,
      }
    : null;
};

export const getNotificationCursor = (
  notifications: Notification[],
  limit: number,
) => {
  return notifications[limit - 1]
    ? {
        createdAt: notifications[limit - 1].createdAt.toISOString(),
        id: notifications[limit - 1].id,
      }
    : null;
};
