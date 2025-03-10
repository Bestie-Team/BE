import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import {
  AlreadyExistRequestException,
  AlreadyFriendsException,
} from 'src/domain/error/exceptions/conflice.exception';
import {
  FriendNotFoundException,
  UserNotFoundException,
} from 'src/domain/error/exceptions/not-found.exception';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { FriendsComponentModule } from 'src/modules/friend/friends-componenet.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import {
  generateFriendEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('FriendsService', () => {
  let friendsService: FriendsService;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        FriendsCheckerModule,
        FriendsComponentModule,
        UsersComponentModule,
        GatheringParticipationModules,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
      providers: [FriendsService],
    }).compile();

    friendsService = app.get<FriendsService>(FriendsService);
    db = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  afterEach(async () => {
    await db.friend.deleteMany();
    await db.user.deleteMany();
  });

  describe('친구 요청', () => {
    const sender = generateUserEntity('sender@test.com', 'sender_id');
    const receiver = generateUserEntity('receiver@test.com', 'receiver_id');

    beforeEach(async () => {
      await db.user.createMany({ data: [sender, receiver] });
    });

    it('이미 친구인 회원에게 요청을 보내면 예외가 발생한다.', async () => {
      await db.friend.create({
        data: generateFriendEntity(sender.id, receiver.id, 'ACCEPTED'),
      });

      await expect(async () =>
        friendsService.request({
          senderId: sender.id,
          receiverId: receiver.id,
        }),
      ).rejects.toThrow(new AlreadyFriendsException());
    });

    it('요청을 중복으로 보내면 예외가 발생한다.', async () => {
      await db.friend.create({
        data: generateFriendEntity(sender.id, receiver.id, 'PENDING'),
      });

      await expect(async () =>
        friendsService.request({
          senderId: sender.id,
          receiverId: receiver.id,
        }),
      ).rejects.toThrow(new AlreadyExistRequestException());
    });

    it('존재하지 않는 회원에게 요청을 보내면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.request({
          senderId: sender.id,
          receiverId: nonExistId,
        }),
      ).rejects.toThrow(new UserNotFoundException());
    });
  });

  describe('친구 삭제', () => {
    const sender = generateUserEntity('sender@test.com', 'sender_id');
    const receiver = generateUserEntity('receiver@test.com', 'receiver_id');

    beforeEach(async () => {
      await db.user.createMany({ data: [sender, receiver] });
    });

    it('친구가 아닌데 삭제하려는 경우 예외가 발생한다.', async () => {
      await expect(async () =>
        friendsService.unfriend(receiver.id, sender.id),
      ).rejects.toThrow(new FriendNotFoundException());
    });

    it('대상이 존재하지 않는 회원이면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.unfriend(nonExistId, sender.id),
      ).rejects.toThrow(new FriendNotFoundException());
    });
  });

  describe('친구 요청 수락', () => {
    const sender = generateUserEntity('sender@test.com', 'sender_id');
    const receiver = generateUserEntity('receiver@test.com', 'receiver_id');
    const otherUser = generateUserEntity('other@test.com', 'other_id');

    beforeEach(async () => {
      await db.user.createMany({ data: [sender, receiver, otherUser] });
    });

    it('대기 상태인 요청이 없는 경우 예외가 발생한다.', async () => {
      await expect(async () =>
        friendsService.accept(otherUser.id, receiver.id),
      ).rejects.toThrow(new FriendNotFoundException());
    });

    it('이미 친구 관계인 회원인 경우 예외가 발생한다.', async () => {
      const friend = generateFriendEntity(sender.id, receiver.id, 'ACCEPTED');
      await db.friend.create({ data: friend });

      await expect(async () =>
        friendsService.accept(sender.id, receiver.id),
      ).rejects.toThrow(new AlreadyFriendsException());
    });

    it('대상이 존재하지 않는 회원이면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.accept(sender.id, nonExistId),
      ).rejects.toThrow(new FriendNotFoundException());
    });
  });

  describe('친구 요청 거절', () => {
    const sender = generateUserEntity('sender@test.com', 'sender_id');
    const receiver = generateUserEntity('receiver@test.com', 'receiver_id');
    const otherUser = generateUserEntity('other@test.com', 'other_id');

    beforeEach(async () => {
      await db.user.createMany({ data: [sender, receiver, otherUser] });
    });

    it('보낸 요청을 취소할 때도 정상 동작한다.', async () => {
      const friend = generateFriendEntity(receiver.id, sender.id);
      await db.friend.create({ data: friend });

      await friendsService.reject(receiver.id, sender.id);
      const rejectedRequest = await db.friend.findUnique({
        where: { id: friend.id },
      });

      expect(rejectedRequest).toBeNull();
    });

    it('대기 상태인 요청이 없는 경우 예외가 발생한다.', async () => {
      await expect(async () =>
        friendsService.reject(otherUser.id, receiver.id),
      ).rejects.toThrow(new FriendNotFoundException());
    });

    it('대상이 존재하지 않는 회원이면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.reject(sender.id, nonExistId),
      ).rejects.toThrow(new FriendNotFoundException());
    });
  });
});
