/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { login } from 'test/helpers/login';
import { generateUserEntity } from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { ChangeAccountIdRequest } from 'src/presentation/dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('(GET) /users/search?search={} - 회원 검색', () => {
    it('회원 검색 정상 동작', async () => {
      const { accessToken } = await login(app);

      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 4
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김기수'), // 3
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '박민수'), //5
      });
      const user4 = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '강민수'), // 1
      });
      const user5 = await prisma.user.create({
        data: generateUserEntity('test5@test.com', 'lighty_5', '조민수'), //6
      });
      const user6 = await prisma.user.create({
        data: generateUserEntity('test6@test.com', 'lighty_6', '강민수'), // 2
      });
      const nonSearchedUser = await prisma.user.create({
        data: generateUserEntity('test7@test.com', 'righty', '이민수'),
      });

      const searchKeyword = 'lig';
      const cursor = {
        name: user4.name, // 강민수
        accountId: user4.accountId,
      };
      const limit = 4;
      const expectedUsers = [user6, user2, user1, user3];
      const url = encodeURI(
        `/users/search?search=${searchKeyword}&cursor=${JSON.stringify(
          cursor,
        )}&limit=${limit}`,
      );
      // when
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<SearchUserResponse> = response;

      expect(status).toEqual(200);
      expect(body.nextCursor).toEqual({
        name: expectedUsers.at(-1)?.name,
        accountId: expectedUsers.at(-1)?.accountId,
      });
      body.users.forEach((user, i) => {
        expect(user.id).toEqual(expectedUsers[i].id);
        expect(user.accountId).toEqual(expectedUsers[i].accountId);
        expect(user.name).toEqual(expectedUsers[i].name);
        expect(user.profileImageUrl).toEqual(expectedUsers[i].profileImageUrl);
      });
    });
  });

  describe('(PATCH) /users/accound-id - 계정 아이디 변경', () => {
    it('계정 아이디 변경 정상 동작', async () => {
      const { accessToken } = await login(app);

      const dto: ChangeAccountIdRequest = {
        accountId: 'new_account_id',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/account-id')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;
      const updatedUser = await prisma.user.findFirst({
        where: {
          accountId: 'new_account_id',
        },
      });

      expect(status).toEqual(204);
      expect(updatedUser).not.toBeNull();
    });

    it('이미 존재하는 계정 아이디로 변경하려는 경우 예외', async () => {
      const { accessToken } = await login(app);

      const user = await prisma.user.create({
        data: generateUserEntity('test@test.com', 'account_id'),
      });
      const dto: ChangeAccountIdRequest = {
        accountId: user.accountId,
      };

      const response = await request(app.getHttpServer())
        .patch('/users/account-id')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(409);
    });
  });
});
