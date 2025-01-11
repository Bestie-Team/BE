import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE } from 'src/domain/error/messages';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { UsersService } from 'src/domain/services/user/users.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UsersPrismaRepository } from 'src/infrastructure/repositories/users-prisma.repository';
import { generateUserEntity } from 'test/helpers/generators';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ClsModule.forRoot(clsOptions), PrismaModule],
      providers: [
        UsersService,
        { provide: UsersRepository, useClass: UsersPrismaRepository },
      ],
    }).compile();

    usersService = app.get<UsersService>(UsersService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('마지막 계정 아이디 변경 후 30일이 지나지 않은 경우 예외', async () => {
    const user = await prisma.user.create({
      data: generateUserEntity(
        'test@test.com',
        'lighty',
        '이름',
        'http://image.com',
        'GOOGLE',
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-02T00:00:01.000Z'),
      ),
    });
    const { id } = user;
    const newAccountId = 'new_lighty';
    const today = new Date('2024-02-01T00:00:00.000Z');

    await expect(
      async () => await usersService.updateAccountId(id, newAccountId, today),
    ).rejects.toThrow(
      new UnprocessableEntityException(ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE),
    );
  });

  it('마지막 계정 아이디 변경 후 30일 경과 후 정상 동작', async () => {
    const user = await prisma.user.create({
      data: generateUserEntity(
        'test@test.com',
        'lighty',
        '이름',
        'http://image.com',
        'GOOGLE',
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-02T00:00:01.000Z'),
      ),
    });
    const { id } = user;
    const newAccountId = 'new_lighty';
    const today = new Date('2024-02-02T00:00:00.000Z');

    await usersService.updateAccountId(id, newAccountId, today);
    const updatedUser = await prisma.user.findUnique({
      where: { id },
    });

    expect(updatedUser?.accountId).toEqual(newAccountId);
  });
});
