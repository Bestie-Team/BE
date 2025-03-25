import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { FriendsComponentModule } from 'src/modules/friend/friends-componenet.module';
import {
  generateFriendEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('FriendsReader', () => {
  let friendsReader: FriendsReader;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        FriendsComponentModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    }).compile();

    friendsReader = app.get<FriendsReader>(FriendsReader);
    db = app.get<PrismaService>(PrismaService);
    db.onModuleInit();
  });

  afterEach(async () => {
    await db.friend.deleteMany();
    await db.user.deleteMany();
  });

  describe('친구 목록 조회', () => {
    const me = generateUserEntity('me@test.com', 'mememe');
    const senderUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`sender${i}@test.com`, `sender${i}`),
    );
    const recevierUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`receiver${i}@test.com`, `receiver${i}`),
    );

    const receivedFriendRelations = senderUsers.map((sender) =>
      generateFriendEntity(sender.id, me.id, 'ACCEPTED'),
    );
    const sentFriendRelations = recevierUsers.map((receiver) =>
      generateFriendEntity(me.id, receiver.id, 'ACCEPTED'),
    );

    beforeEach(async () => {
      await db.user.createMany({
        data: [me, ...senderUsers, ...recevierUsers],
      });
      await db.friend.createMany({
        data: [...receivedFriendRelations, ...sentFriendRelations],
      });
    });

    it('친구 목록 조회 정상 동작.', async () => {
      const result = await friendsReader.read(me.id, {
        cursor: {
          accountId: 'a',
          name: '가',
        },
        limit: 10,
      });
      const { users: friends } = result;

      expect(friends.length).toEqual(senderUsers.length + recevierUsers.length);
    });

    it('탈퇴한 회원은 조회되지 않아야 한다.', async () => {
      const deletedSender = senderUsers[0];
      const deletedReceiver = recevierUsers[0];

      await db.user.update({
        data: { deletedAt: new Date() },
        where: {
          id: deletedSender.id,
        },
      });
      await db.user.update({
        data: { deletedAt: new Date() },
        where: {
          id: deletedReceiver.id,
        },
      });

      const result = await friendsReader.read(me.id, {
        cursor: {
          accountId: 'a',
          name: '가',
        },
        limit: 10,
      });
      const { users: friends } = result;

      expect(friends.length).toEqual(
        senderUsers.length + recevierUsers.length - 2,
      );
    });
  });

  describe('친구 요청 수 조회', () => {
    const me = generateUserEntity('me@test.com', 'mememe');
    const senderUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`sender${i}@test.com`, `sender${i}`),
    );
    const recevierUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`receiver${i}@test.com`, `receiver${i}`),
    );

    const receivedFriendRelations = senderUsers.map((sender) =>
      generateFriendEntity(sender.id, me.id, 'PENDING'),
    );
    const sentFriendRelations = recevierUsers.map((receiver) =>
      generateFriendEntity(me.id, receiver.id, 'PENDING'),
    );

    beforeEach(async () => {
      await db.user.createMany({
        data: [me, ...senderUsers, ...recevierUsers],
      });
      await db.friend.createMany({
        data: [...receivedFriendRelations, ...sentFriendRelations],
      });
    });

    it('친구 요청 수 조회 정상 동작', async () => {
      const friendCount = await friendsReader.countRequests(me.id);

      expect(friendCount.count).toEqual(
        sentFriendRelations.length + receivedFriendRelations.length,
      );
    });

    it('탈퇴한 회원이 보냈거나, 탈퇴한 회원에게 보낸 요청은 집계되지 않는다.', async () => {
      // 나에게 요청을 보낸 회원
      const deletedSender1 = senderUsers[0];
      const deletedSender2 = senderUsers[1];
      const deletedReceiver = recevierUsers[0];
      await db.user.update({
        data: { deletedAt: new Date() },
        where: {
          id: deletedSender1.id,
        },
      });
      await db.user.update({
        data: { deletedAt: new Date() },
        where: {
          id: deletedSender2.id,
        },
      });
      // 내가 요청을 보낸 회원
      await db.user.update({
        data: { deletedAt: new Date() },
        where: {
          id: deletedReceiver.id,
        },
      });

      const friendCount = await friendsReader.countRequests(me.id);

      expect(friendCount.count).toEqual(
        sentFriendRelations.length + receivedFriendRelations.length - 3,
      );
    });
  });

  describe('보낸 요청, 받은 요청 목록 조회', () => {
    const me = generateUserEntity('me@test.com', 'mememe');

    const senderUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`sender${i}@test.com`, `sender${i}`),
    );
    const recevierUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`receiver${i}@test.com`, `receiver${i}`),
    );

    const receivedFriendRelations = senderUsers.map((sender) =>
      generateFriendEntity(sender.id, me.id, 'PENDING'),
    );
    const sentFriendRelations = recevierUsers.map((receiver) =>
      generateFriendEntity(me.id, receiver.id, 'PENDING'),
    );

    beforeEach(async () => {
      await db.user.createMany({
        data: [me, ...senderUsers, ...recevierUsers],
      });
      await db.friend.createMany({
        data: [...receivedFriendRelations, ...sentFriendRelations],
      });
    });

    describe('보낸 요청 목록 조회', () => {
      it('보낸 요청 목록 조회 정상 동작.', async () => {
        const result = await friendsReader.readSentRequests(me.id, {
          cursor: {
            accountId: 'a',
            name: '가',
          },
          limit: 10,
        });
        const { requests } = result;

        expect(requests.length).toEqual(sentFriendRelations.length);
      });

      it('탈퇴한 회원에게 보낸 요청은 조회되지 않는다.', async () => {
        const deletedSender = recevierUsers[0];
        await db.user.update({
          data: { deletedAt: new Date() },
          where: {
            id: deletedSender.id,
          },
        });

        const result = await friendsReader.readSentRequests(me.id, {
          cursor: {
            accountId: 'a',
            name: '가',
          },
          limit: 10,
        });
        const { requests } = result;

        expect(requests.length).toEqual(sentFriendRelations.length - 1);
        requests.forEach((request) => {
          expect(request.sender.id).not.toEqual(deletedSender.id);
        });
      });
    });
    describe('받은 요청 목록 조회', () => {
      it('받은 요청 목록 조회 정상 동작.', async () => {
        const result = await friendsReader.readReceivedRequests(me.id, {
          cursor: {
            accountId: 'a',
            name: '가',
          },
          limit: 10,
        });
        const { requests } = result;

        expect(requests.length).toEqual(receivedFriendRelations.length);
      });

      it('탈퇴한 회원이 보낸 요청은 조회되지 않는다.', async () => {
        const deletedSender = senderUsers[0];
        await db.user.update({
          data: { deletedAt: new Date() },
          where: {
            id: deletedSender.id,
          },
        });

        const result = await friendsReader.readReceivedRequests(me.id, {
          cursor: {
            accountId: 'a',
            name: '가',
          },
          limit: 10,
        });
        const { requests } = result;

        expect(requests.length).toEqual(receivedFriendRelations.length - 1);
        requests.forEach((request) => {
          expect(request.sender.id).not.toEqual(deletedSender.id);
        });
      });
    });
  });
});
