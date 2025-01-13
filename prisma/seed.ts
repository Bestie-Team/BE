import {
  FriendStatus,
  GatheringParticipationStatus,
  GatheringType,
  OAuthProvider,
  PrismaClient,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

function getRandomDateInRange(startYear: number, endYear: number): Date {
  const start = new Date(`${startYear}-01-01`).getTime();
  const end = new Date(`${endYear}-12-31`).getTime();
  return new Date(start + Math.random() * (end - start));
}

async function main() {
  // Create users
  const usersData = Array.from({ length: 30 }, (_, i) => ({
    id: uuidv4(),
    email: `user${i + 1}@example.com`,
    provider: OAuthProvider.GOOGLE,
    name: `사용자${i + 1}`,
    accountId: `user${i + 1}`,
    profileImageUrl: null,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  const users = await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  // Create groups
  const groupsData = Array.from({ length: 5 }, (_, i) => ({
    id: uuidv4(),
    name: `그룹 ${i + 1}`,
    description: `그룹 ${i + 1} 설명`,
    groupImageUrl: `https://example.com/group${i + 1}.jpg`,
    gatheringCount: 0,
    ownerId: usersData[i]?.id,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  const groups = await prisma.group.createMany({
    data: groupsData,
    skipDuplicates: true,
  });

  // Create gatherings
  const gatheringsData = Array.from({ length: 30 }, (_, i) => ({
    id: uuidv4(),
    type: GatheringType.FRIEND,
    groupId: null,
    hostUserId: usersData[i % usersData.length]?.id,
    name: `모임 ${i + 1}`,
    description: `모임 ${i + 1} 설명`,
    gatheringDate: new Date(),
    address: `${i + 1}번지 테스트 거리, 테스트 도시`,
    invitationImageUrl: `https://example.com/invite${i + 1}.jpg`,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  const gatherings = await prisma.gathering.createMany({
    data: gatheringsData,
    skipDuplicates: true,
  });

  // Add gathering participations
  const gatheringParticipationsData = Array.from({ length: 90 }, (_, i) => ({
    id: uuidv4(),
    gatheringId: gatheringsData[i % gatheringsData.length]?.id,
    participantId: usersData[(i + 1) % usersData.length]?.id,
    status:
      i % 3 === 0
        ? GatheringParticipationStatus.PENDING
        : GatheringParticipationStatus.ACCEPTED,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  await prisma.gatheringParticipation.createMany({
    data: gatheringParticipationsData,
    skipDuplicates: true,
  });

  // Create feeds
  const feedsData = Array.from({ length: 30 }, (_, i) => ({
    id: uuidv4(),
    writerId: usersData[i % usersData.length]?.id,
    gatheringId: gatheringsData[i % gatheringsData.length]?.id,
    content: `피드 ${i + 1}의 내용`,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  const feeds = await prisma.feed.createMany({
    data: feedsData,
    skipDuplicates: true,
  });

  // Add comments to feeds
  const feedCommentsData = Array.from({ length: 60 }, (_, i) => ({
    id: uuidv4(),
    feedId: feedsData[i % feedsData.length]?.id,
    writerId: usersData[(i + 2) % usersData.length]?.id,
    content: `피드 ${(i % feedsData.length) + 1}에 대한 댓글 ${i + 1}`,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  await prisma.feedComment.createMany({
    data: feedCommentsData,
    skipDuplicates: true,
  });

  // Add friend relationships
  const friendsData = Array.from({ length: 60 }, (_, i) => ({
    id: uuidv4(),
    senderId: usersData[i % usersData.length]?.id,
    receiverId: usersData[(i + 1) % usersData.length]?.id,
    status: i % 3 === 0 ? FriendStatus.PENDING : FriendStatus.ACCEPTED,
    createdAt: getRandomDateInRange(2023, 2024),
    updatedAt: new Date(),
  }));

  await prisma.friend.createMany({
    data: friendsData,
    skipDuplicates: true,
  });

  // Add group participations
  const groupParticipationsData = Array.from({ length: 30 }, (_, i) => ({
    id: uuidv4(),
    groupId: groupsData[i % groupsData.length]?.id,
    participantId: usersData[(i + 2) % usersData.length]?.id,
    createdAt: getRandomDateInRange(2023, 2024),
  }));

  await prisma.groupParticipation.createMany({
    data: groupParticipationsData,
    skipDuplicates: true,
  });

  console.log(
    'Seeding completed successfully with at least 30 entries for each entity, including friends and group participations!',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
