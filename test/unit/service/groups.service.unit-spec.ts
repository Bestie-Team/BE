import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { clsOptions } from 'src/configs/cls/cls-options';
import { AlreadyExistMemberException } from 'src/domain/error/exceptions/conflice.exception';
import {
  FriendshipRequiredException,
  GroupMemberLimitExceededException,
  ReportedUserCannotInviteException,
} from 'src/domain/error/exceptions/unprocessable.exception';
import { GroupsService } from 'src/domain/services/groups/groups.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';
import { GroupsComponentModule } from 'src/modules/group/groups-component.module';
import { GroupsModule } from 'src/modules/group/groups.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import {
  generateFriendEntity,
  generateGroupEntity,
  generateGroupParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('GroupsService', () => {
  let groupsService: GroupsService;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        GroupsComponentModule,
        GroupParticipationsModule,
        UsersComponentModule,
        FriendsCheckerModule,
        GroupsModule,
        EventEmitterModule.forRoot(),
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: () => true })
      .compile();

    groupsService = app.get<GroupsService>(GroupsService);
    db = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await db.groupParticipation.deleteMany();
    await db.group.deleteMany();
    await db.friend.deleteMany();
    await db.user.deleteMany();
  });

  describe('그룹원 추가', () => {
    const me = generateUserEntity('me@test.com', 'memememe');
    const noneMemberUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`test${i}@test.com`, `account${i}`),
    );

    const friendRelations = Array.from({ length: 5 }, (_, i) =>
      generateFriendEntity(noneMemberUsers[i].id, me.id, 'ACCEPTED'),
    );

    const group = generateGroupEntity(me.id);

    beforeEach(async () => {
      await db.user.createMany({ data: [me, ...noneMemberUsers] });
      await db.friend.createMany({ data: friendRelations });
      await db.group.create({ data: group });
    });

    it('그룹원 추가 정상 동작.', async () => {
      const newMemberIds = noneMemberUsers.map((user) => user.id);

      await groupsService.addMembers(group.id, me.id, newMemberIds);
      const groupParticipations = await db.groupParticipation.findMany();

      expect(groupParticipations.length).toEqual(newMemberIds.length);
    });

    it('그룹원으로 추가하려는 회원 중 친구 관계가 아닌 회원이 존재하는 경우 예외가 발생한다.', async () => {
      const noneFriendUser = generateUserEntity('none@test.com', 'none');
      await db.user.create({ data: noneFriendUser });

      const newMemberIds = noneMemberUsers.map((user) => user.id);

      await expect(() =>
        groupsService.addMembers(group.id, me.id, [
          ...newMemberIds,
          noneFriendUser.id,
        ]),
      ).rejects.toThrow(new FriendshipRequiredException());
    });

    it('기존 그룹원과 새로 추가하려는 인원의 총 합이 10명을 초과하는 경우 예외가 발생한다.', async () => {
      const memberUsers = Array.from({ length: 6 }, (_, i) =>
        generateUserEntity(`member${i}@test.com`, `member${i}`),
      );
      const groupParticipations = Array.from({ length: 6 }, (_, i) =>
        generateGroupParticipationEntity(
          group.id,
          memberUsers[i].id,
          new Date(),
          'ACCEPTED',
        ),
      );
      await db.user.createMany({ data: memberUsers });
      await db.groupParticipation.createMany({ data: groupParticipations });

      const newMemberIds = noneMemberUsers.map((user) => user.id);

      await expect(() =>
        groupsService.addMembers(group.id, me.id, newMemberIds),
      ).rejects.toThrow(new GroupMemberLimitExceededException());
    });

    it('이미 그룹원인 회원을 초대하려는 경우 예외가 발생한다.', async () => {
      const memberUser = generateUserEntity('member@test.com', 'member');
      const friendRelation = generateFriendEntity(
        me.id,
        memberUser.id,
        'ACCEPTED',
      );
      const groupParticipation = generateGroupParticipationEntity(
        group.id,
        memberUser.id,
        new Date(),
        'ACCEPTED',
      );
      await db.user.create({ data: memberUser });
      await db.friend.create({ data: friendRelation });
      await db.groupParticipation.create({ data: groupParticipation });

      const newMemberIds = noneMemberUsers.map((user) => user.id);

      await expect(() =>
        groupsService.addMembers(group.id, me.id, [
          memberUser.id,
          ...newMemberIds,
        ]),
      ).rejects.toThrow(new AlreadyExistMemberException());
    });

    it('그룹을 신고한 회원을 초대하려는 경우 예외가 발생한다.', async () => {
      const reporter = generateUserEntity('reporter@test.com', 'report');
      const friendRealtion = generateFriendEntity(
        reporter.id,
        me.id,
        'ACCEPTED',
      );
      const groupParticipation = generateGroupParticipationEntity(
        group.id,
        reporter.id,
        new Date(),
        'REPORTED',
      );
      await db.user.create({ data: reporter });
      await db.friend.create({ data: friendRealtion });
      await db.groupParticipation.create({ data: groupParticipation });

      await expect(() =>
        groupsService.addMembers(group.id, me.id, [reporter.id]),
      ).rejects.toThrow(new ReportedUserCannotInviteException());
    });
  });
});
