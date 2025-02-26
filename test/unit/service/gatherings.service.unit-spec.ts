import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import {
  GATHERING_CREATION_PAST_DATE_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  NOT_FOUND_GROUP_MESSAGE,
  REQUIRED_GROUP_OR_FRIEND_MESSAGE,
} from 'src/domain/error/messages';
import { GatheringsService } from 'src/domain/services/gatherings/gatherings.service';
import { GatheringPrototype } from 'src/domain/types/gathering.types';
import { EventModule } from 'src/infrastructure/event/event.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';
import { GroupsComponentModule } from 'src/modules/group/groups-component.module';
import { NotificationsManagerModule } from 'src/modules/notification/notifications-manager.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import {
  generateFriendEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('GatheringsService', () => {
  let gatheringsService: GatheringsService;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        GroupsComponentModule,
        GroupParticipationsModule,
        GatheringsComponentModule,
        GatheringParticipationModules,
        NotificationsManagerModule,
        EventModule,
        UsersComponentModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
      providers: [GatheringsService],
    }).compile();

    gatheringsService = app.get<GatheringsService>(GatheringsService);
    db = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await db.gatheringParticipation.deleteMany();
    await db.gathering.deleteMany();
    await db.friend.deleteMany();
    await db.user.deleteMany();
  });

  describe('모임 생성', () => {
    const host = generateUserEntity('host@test.com', 'host_id');
    const friendUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`receiver${i}@test.com`, `receiver${i}_id`),
    );
    const nonFriendUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`nonfriend${i}@test.com`, `nonfriend${i}_id`),
    );
    const friendRelations = Array.from({ length: 5 }, (_, i) =>
      generateFriendEntity(host.id, friendUsers[i].id, 'ACCEPTED'),
    );

    beforeEach(async () => {
      await db.user.createMany({
        data: [host, ...friendUsers, ...nonFriendUsers],
      });
      await db.friend.createMany({ data: friendRelations });
    });

    it('일반 모임 생성 시 친구가 아닌 회원이 한 명이라도 존재할 경우 예외가 발생한다.', async () => {
      const friendIdsWithNonFriendId = [
        ...friendUsers.map((user) => user.id),
        nonFriendUsers[0].id,
      ];

      const prototype: GatheringPrototype = {
        type: 'FRIEND',
        hostUserId: host.id,
        gatheringDate: new Date(Date.now() + 1000).toISOString(),
        name: '테스트 모임',
        description: '테스트 모임 설명',
        address: '집',
        groupId: null,
        invitationImageUrl: 'https://test.com',
      };
      await expect(() =>
        gatheringsService.create(prototype, friendIdsWithNonFriendId),
      ).rejects.toThrow(
        new BadRequestException(IS_NOT_FRIEND_RELATION_MESSAGE),
      );
    });

    it('일반 모임에서 친구 번호가 null인 경우 예외가 발생한다.', async () => {
      const prototype: GatheringPrototype = {
        type: 'FRIEND',
        hostUserId: host.id,
        gatheringDate: new Date(Date.now() + 1000).toISOString(),
        name: '테스트 모임',
        description: '테스트 모임 설명',
        address: '집',
        groupId: null,
        invitationImageUrl: 'https://test.com',
      };

      await expect(() =>
        gatheringsService.create(prototype, null),
      ).rejects.toThrow(
        new BadRequestException(REQUIRED_GROUP_OR_FRIEND_MESSAGE),
      );
    });

    it('그룹 모임에서 그룹 번호가 null인 경우 예외가 발생한다.', async () => {
      const prototype: GatheringPrototype = {
        type: 'GROUP',
        hostUserId: host.id,
        gatheringDate: new Date(Date.now() + 1000).toISOString(),
        name: '테스트 모임',
        description: '테스트 모임 설명',
        address: '집',
        groupId: null,
        invitationImageUrl: 'https://test.com',
      };

      await expect(() =>
        gatheringsService.create(prototype, null),
      ).rejects.toThrow(
        new BadRequestException(REQUIRED_GROUP_OR_FRIEND_MESSAGE),
      );
    });

    it('존재하지 않는 그룹으로 모임을 생성하려는 경우 예외가 발생한다.', async () => {
      const nonExistGroupId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      const prototype: GatheringPrototype = {
        type: 'GROUP',
        hostUserId: host.id,
        gatheringDate: new Date(Date.now() + 1000).toISOString(),
        name: '테스트 모임',
        description: '테스트 모임 설명',
        address: '집',
        groupId: nonExistGroupId,
        invitationImageUrl: 'https://test.com',
      };

      await expect(() =>
        gatheringsService.create(prototype, null),
      ).rejects.toThrow(new NotFoundException(NOT_FOUND_GROUP_MESSAGE));
    });

    it('모임일이 현재 날짜 이전인 경우 예외가 발생한다.', async () => {
      const friendIds = friendUsers.map((user) => user.id);
      const prototype: GatheringPrototype = {
        type: 'FRIEND',
        hostUserId: host.id,
        gatheringDate: new Date(Date.now() - 1).toISOString(),
        name: '테스트 모임',
        description: '테스트 모임 설명',
        address: '집',
        groupId: null,
        invitationImageUrl: 'https://test.com',
      };

      await expect(() =>
        gatheringsService.create(prototype, friendIds),
      ).rejects.toThrow(
        new BadRequestException(GATHERING_CREATION_PAST_DATE_MESSAGE),
      );
    });
  });
});
