import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import {
  generateBlockedUser,
  generateUserEntity,
} from 'test/helpers/generators';

describe('UsersReader', () => {
  let usersReader: UsersReader;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        UsersComponentModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    }).compile();

    usersReader = app.get<UsersReader>(UsersReader);
    db = app.get<PrismaService>(PrismaService);
    db.onModuleInit();
  });

  afterEach(async () => {
    await db.blockedUser.deleteMany();
    await db.user.deleteMany();
  });

  describe('회원 검색', () => {
    const me = generateUserEntity('me@test.com', 'mememem');
    const users = Array.from({ length: 10 }, (_, i) =>
      generateUserEntity(`test${i}@test.com`, `test${i}_id`),
    );

    beforeEach(async () => {
      await db.user.createMany({ data: [me, ...users] });
    });

    it('회원 검색 정상 동작', async () => {
      const result = await usersReader.search(me.id, {
        search: 'test',
        paginationInput: { cursor: { name: '가', accountId: 'a' }, limit: 10 },
      });
      const { users: searchedUsers } = result;

      expect(searchedUsers.length).toBe(users.length);
    });

    it('차단된 회원한 검색되지 않는다.', async () => {
      const blockedUser1 = generateBlockedUser(me.id, users[0].id);
      const blockedUser2 = generateBlockedUser(me.id, users[1].id);
      await db.blockedUser.createMany({
        data: [blockedUser1, blockedUser2],
      });

      const result = await usersReader.search(me.id, {
        search: 'test',
        paginationInput: { cursor: { name: '가', accountId: 'a' }, limit: 10 },
      });
      const { users: searchedUsers } = result;

      expect(searchedUsers.length).toBe(users.length - 2);
      searchedUsers.forEach((user) => {
        expect(user.id).not.toBe(users[0].id);
        expect(user.id).not.toBe(users[1].id);
      });
    });

    it('내가 차단된 경우에는 검색에 영향을 주지 않는다.', async () => {
      const blockedUser = generateBlockedUser(users[0].id, me.id);
      await db.blockedUser.create({ data: blockedUser });

      const result = await usersReader.search(me.id, {
        search: 'test',
        paginationInput: { cursor: { name: '가', accountId: 'a' }, limit: 10 },
      });
      const { users: searchedUsers } = result;

      expect(searchedUsers.length).toBe(users.length);
    });

    it('탈퇴한 회원은 검색되지 않는다.', async () => {
      const deletedUser = users[0];
      await db.user.update({
        data: { deletedAt: new Date() },
        where: { id: deletedUser.id },
      });

      const result = await usersReader.search(me.id, {
        search: 'test',
        paginationInput: { cursor: { name: '가', accountId: 'a' }, limit: 10 },
      });
      const { users: searchedUsers } = result;

      expect(searchedUsers.length).toBe(users.length - 1);
    });
  });
});
