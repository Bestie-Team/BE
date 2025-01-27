import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import {
  GatheringParticipationStatus,
  GatheringType,
  Provider,
} from 'src/shared/types';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendStatus, GroupParticipationStatus } from '@prisma/client';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';

export const generateUserEntity = (
  email: string,
  accountId: string,
  name = '이름',
  profileImageUrl = 'https://image.com',
  provider: Provider = 'GOOGLE',
  stdDate: Date = new Date(),
  updatedAt?: Date,
): UserEntity =>
  UserEntity.create(
    { accountId, email, name, profileImageUrl, provider },
    v4,
    stdDate,
    updatedAt ? updatedAt : undefined,
  );

export const generateFriendEntity = (
  senderId: string,
  receiverId: string,
  status: FriendStatus = 'PENDING',
): FriendEntity => {
  const stdDate = new Date();
  return new FriendEntity(v4(), senderId, receiverId, stdDate, stdDate, status);
};

export const generateGroupEntity = (
  ownerId: string,
  name = '멋쟁이들의 그룹',
  description = '멋쟁이만 참여 가능',
  groupImageUrl = 'https://image.com',
): GroupEntity => {
  const stdDate = new Date();
  return GroupEntity.create(
    { name, description, groupImageUrl, ownerId },
    v4,
    stdDate,
  );
};

export const generateGroupParticipationEntity = (
  groupId: string,
  participantId: string,
  stdDate: Date,
  status?: GroupParticipationStatus,
): GroupParticipationEntity => {
  return GroupParticipationEntity.create(
    { groupId, participantId, status },
    v4,
    stdDate,
  );
};

export const generateGatheringEntity = (
  hostUserId: string,
  stdDate: Date = new Date(),
  name = '두리집 청소 모임',
  gatheringDate = new Date(),
  address = '두리집',
  description = '두리집 청소를 위한 모임입니다.',
  invitationImageUrl = 'https://image.com',
  type: GatheringType = 'FRIEND',
  groupId: string | null = null,
): GatheringEntity => {
  return GatheringEntity.create(
    {
      groupId,
      address,
      description,
      gatheringDate: gatheringDate.toISOString(),
      hostUserId,
      invitationImageUrl,
      name,
      type,
    },
    v4,
    stdDate,
  );
};

export const generateGatheringParticipationEntity = (
  gatheringId: string,
  participantId: string,
  status: GatheringParticipationStatus = 'PENDING',
  stdDate = new Date(),
): GatheringParticipationEntity => {
  return GatheringParticipationEntity.create(
    {
      gatheringId,
      participantId,
      status,
    },
    v4,
    stdDate,
  );
};

export const generateFeedEntity = (
  writerId: string,
  gatheringId: string | null = null,
  stdDate = new Date(),
  content = '안녕하세요 안녕하세요? 안녕하세요! 안녕하세요;',
): FeedEntity => {
  return FeedEntity.create({ writerId, content, gatheringId }, v4, stdDate);
};

export const generateFeedImageEntity = (
  index: number,
  url = 'https://cdn.lighty.today/image',
  stdDate: Date = new Date(),
) => FeedImageEntity.create({ url, index }, v4, stdDate);

export const generateFriendFeedVisibilityEntity = (
  feedId: string,
  userId: string,
  stdDate: Date = new Date(),
) => FriendFeedVisibilityEntity.create({ feedId, userId }, stdDate);

export const generateFeedCommentEntity = (
  feedId: string,
  writerId: string,
  content = '안녕하세요? 안녕하세요! 안녕하세요; 안녕하세요 안녕',
  stdDate = new Date(),
): FeedCommentEntity =>
  FeedCommentEntity.create({ content, feedId, writerId }, v4, stdDate);

export const generateNotificationEntity = (
  userId: string,
  type: 'FRIEND_REQUEST',
  relatedId: string | null = null,
  stdDate = new Date(),
  message = '알림 메시지입니다~',
  title = '알림 제목입니다~~',
): NotificationEntity => {
  return NotificationEntity.create(
    { message, relatedId, title, type, userId },
    v4,
    stdDate,
  );
};
