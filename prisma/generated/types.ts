import type { ColumnType } from 'kysely';
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const OAuthProvider = {
  GOOGLE: 'GOOGLE',
  KAKAO: 'KAKAO',
  APPLE: 'APPLE',
} as const;
export type OAuthProvider = (typeof OAuthProvider)[keyof typeof OAuthProvider];
export const FriendStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
} as const;
export type FriendStatus = (typeof FriendStatus)[keyof typeof FriendStatus];
export type BlockedFeed = {
  userId: string;
  feedId: string;
  created_at: Timestamp;
};
export type Feed = {
  id: string;
  writer_id: string;
  content: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type FeedComment = {
  id: string;
  feed_id: string;
  writer_id: string;
  content: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type FeedImage = {
  id: string;
  feed_id: string;
  url: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type Friend = {
  id: string;
  friend1Id: string;
  friend2Id: string;
  created_at: Timestamp;
};
export type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: Timestamp;
};
export type Gathering = {
  id: string;
  host_user_id: string;
  name: string;
  description: string;
  gathering_date: Timestamp;
  address: string;
  invitation_image_url: string;
  is_done: Generated<boolean>;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type GatheringInvitation = {
  id: string;
  gathering_id: string;
  inviter_id: string;
  invitee_id: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type GatheringParticipation = {
  id: string;
  gathering_id: string;
  participant_id: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type Group = {
  id: string;
  name: string;
  description: string;
  group_image_url: string;
  gathering_count: Generated<number>;
  owner_id: string;
  created_at: Timestamp;
};
export type GroupParticipation = {
  id: string;
  group_id: string;
  participant_id: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type User = {
  id: string;
  email: string;
  provider: OAuthProvider;
  name: string;
  account_id: string;
  avatar_url: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type DB = {
  blocked_feed: BlockedFeed;
  feed: Feed;
  feed_comment: FeedComment;
  feed_image: FeedImage;
  friend: Friend;
  friend_request: FriendRequest;
  gathering: Gathering;
  gathering_invitation: GatheringInvitation;
  gathering_participation: GatheringParticipation;
  group: Group;
  group_participation: GroupParticipation;
  user: User;
};
