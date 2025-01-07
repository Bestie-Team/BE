/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import {
  generateFriendEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';

describe('GroupsController (e2e)', () => {
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
    await prisma.groupParticipation.deleteMany();
    await prisma.group.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /groups - 그룹 생성', () => {
    it('그룹 생성 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'), // 4
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김진수'), // 1
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '김진수'), // 2
      });
      const user4 = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '김진수'), // 3
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });
      const friendRealtion4 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user4.id, 'ACCEPTED'),
      });

      const dto: CreateGroupRequest = {
        name: '멋쟁이들의 모임',
        description: '멋쟁이만 출입 가능',
        friendIds: [user1.id, user2.id, user3.id, user4.id],
        groupImageUrl: 'https://image.com',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;
      console.log(body);

      expect(status).toEqual(201);
    });

    it('그룹 생성 시 친구가 아닌 회원 번호가 있는 경우 예외', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'), // 4
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김진수'), // 1
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });

      const dto: CreateGroupRequest = {
        name: '멋쟁이들의 모임',
        description: '멋쟁이만 출입 가능',
        friendIds: [user1.id, user2.id],
        groupImageUrl: 'https://image.com',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(400);
    });
  });
});
