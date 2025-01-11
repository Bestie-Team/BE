import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { GatheringType, Provider } from 'src/shared/types';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendStatus } from '@prisma/client';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';

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
): GroupParticipationEntity => {
  return GroupParticipationEntity.create(
    { groupId, participantId },
    v4,
    stdDate,
  );
};

export const generateGatheringEntity = (
  hostUserId: string,
  gatheringDate = new Date().toISOString(),
  name = '두리집 청소 모임',
  address = '두리집',
  description = '두리집 청소를 위한 모임입니다.',
  invitationImageUrl = 'https://image.com',
  type: GatheringType = 'FRIEND',
  stdDate: Date = new Date(),
  groupId: string | null = null,
): GatheringEntity => {
  return GatheringEntity.create(
    {
      groupId,
      address,
      description,
      gatheringDate,
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
  stdDate = new Date(),
): GatheringParticipationEntity => {
  return GatheringParticipationEntity.create(
    {
      gatheringId,
      participantId,
    },
    v4,
    stdDate,
  );
};
