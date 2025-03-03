import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE } from 'src/domain/error/messages';
import { UsersRepository } from 'src/domain/interface/user/users.repository';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UsersPrismaRepository } from 'src/infrastructure/repositories/user/users-prisma.repository';
import { generateUserEntity } from 'test/helpers/generators';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import { UsersReader } from 'src/domain/components/user/users-reader';

describe('UsersWriter', () => {
  let usersWriter: UsersWriter;
  let prisma: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ClsModule.forRoot(clsOptions), PrismaModule],
      providers: [
        UsersWriter,
        UsersReader,
        { provide: UsersRepository, useClass: UsersPrismaRepository },
      ],
    }).compile();

    usersWriter = app.get<UsersWriter>(UsersWriter);
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
      async () => await usersWriter.updateAccountId(id, newAccountId, today),
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

    await usersWriter.updateAccountId(id, newAccountId, today);
    const updatedUser = await prisma.user.findUnique({
      where: { id },
    });

    expect(updatedUser?.accountId).toEqual(newAccountId);
  });
});
