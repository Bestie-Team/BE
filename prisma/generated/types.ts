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
export const GatheringType = {
  FRIEND: 'FRIEND',
  GROUP: 'GROUP',
} as const;
export type GatheringType = (typeof GatheringType)[keyof typeof GatheringType];
export const FriendStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REPORTED: 'REPORTED',
} as const;
export type FriendStatus = (typeof FriendStatus)[keyof typeof FriendStatus];
export const GatheringParticipationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;
export type GatheringParticipationStatus =
  (typeof GatheringParticipationStatus)[keyof typeof GatheringParticipationStatus];
export type BlockedFeed = {
  userId: string;
  feedId: string;
  created_at: Timestamp;
};
export type Feed = {
  id: string;
  writer_id: string;
  gathering_id: string | null;
  content: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type FeedComment = {
  id: string;
  feed_id: string;
  writer_id: string;
  content: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type FeedImage = {
  id: string;
  feed_id: string;
  index: number;
  url: string;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type Friend = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: Generated<FriendStatus>;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type FriendFeedVisibility = {
  feed_id: string;
  user_id: string;
  createdAt: Timestamp;
};
export type Gathering = {
  id: string;
  type: GatheringType;
  group_id: string | null;
  host_user_id: string;
  name: string;
  description: string;
  gathering_date: Timestamp;
  address: string;
  invitation_image_url: string;
  ended_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type GatheringParticipation = {
  id: string;
  gathering_id: string;
  participant_id: string;
  status: Generated<GatheringParticipationStatus>;
  created_at: Timestamp;
  updated_at: Timestamp;
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
  updated_at: Timestamp;
};
export type GroupParticipation = {
  id: string;
  group_id: string;
  participant_id: string;
  created_at: Timestamp;
};
export type User = {
  id: string;
  email: string;
  provider: OAuthProvider;
  name: string;
  account_id: string;
  profile_image_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};
export type DB = {
  blocked_feed: BlockedFeed;
  feed: Feed;
  feed_comment: FeedComment;
  feed_image: FeedImage;
  friend: Friend;
  friend_feed_visibility: FriendFeedVisibility;
  gathering: Gathering;
  gathering_participation: GatheringParticipation;
  group: Group;
  group_participation: GroupParticipation;
  user: User;
};
