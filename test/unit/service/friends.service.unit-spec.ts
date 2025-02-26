import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import {
  FRIEND_ALREADY_EXIST_MESSAGE,
  FRIEND_REQUEST_ALREADY_EXIST_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
  NOT_FOUND_USER_MESSAGE,
} from 'src/domain/error/messages';
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
      ).rejects.toThrow(new ConflictException(FRIEND_ALREADY_EXIST_MESSAGE));
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
      ).rejects.toThrow(
        new ConflictException(FRIEND_REQUEST_ALREADY_EXIST_MESSAGE),
      );
    });

    it('존재하지 않는 회원에게 요청을 보내면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.request({
          senderId: sender.id,
          receiverId: nonExistId,
        }),
      ).rejects.toThrow(new NotFoundException(NOT_FOUND_USER_MESSAGE));
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
      ).rejects.toThrow(new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE));
    });

    it('대상이 존재하지 않는 회원이면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.unfriend(nonExistId, sender.id),
      ).rejects.toThrow(new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE));
    });
  });

  describe('친구 요청 수락', () => {
    const sender = generateUserEntity('sender@test.com', 'sender_id');
    const receiver = generateUserEntity('receiver@test.com', 'receiver_id');

    beforeEach(async () => {
      await db.user.createMany({ data: [sender, receiver] });
    });

    it('이미 친구 관계인 회원인 경우 예외가 발생한다.', async () => {
      const friend = generateFriendEntity(sender.id, receiver.id, 'ACCEPTED');
      await db.friend.create({ data: friend });

      await expect(async () =>
        friendsService.accept(sender.id, receiver.id),
      ).rejects.toThrow(new ConflictException(FRIEND_ALREADY_EXIST_MESSAGE));
    });

    it('대상이 존재하지 않는 회원이면 예외가 발생한다.', async () => {
      const nonExistId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      await expect(async () =>
        friendsService.accept(sender.id, nonExistId),
      ).rejects.toThrow(new NotFoundException(NOT_FOUND_FRIEND_MESSAGE));
    });
  });
});
