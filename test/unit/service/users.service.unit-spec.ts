import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { clsOptions } from 'src/configs/cls/cls-options';
import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { DuplicateAccountIdException } from 'src/domain/error/exceptions/conflice.exception';
import { ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE } from 'src/domain/error/messages';
import { UsersService } from 'src/domain/services/user/users.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UsersModule } from 'src/modules/user/users.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { generateUserEntity } from 'test/helpers/generators';

describe('UsersService', () => {
  let usersService: UsersService;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        UsersComponentModule,
        UsersModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: () => true })
      .compile();

    usersService = app.get<UsersService>(UsersService);
    db = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  afterEach(async () => {
    await db.user.deleteMany();
  });

  describe('계정 아이디 변경', () => {
    it('가입일과 변경일이 같다면 첫 변경이라는 뜻이므로 30일이 지나지 않아도 변경이 가능하다', async () => {
      const createdAt = new Date(2025, 1, 2);
      const user = generateUserEntity(
        'test@test.com',
        'account_id',
        '민수',
        'https://image.com',
        'GOOGLE',
        createdAt,
        createdAt,
      );
      await db.user.create({ data: user });

      const today = new Date(2025, 1, 3);
      const newAccountId = 'new_id';

      await usersService.changeAccountId(user.id, newAccountId, today);
      const updatedUser = await db.user.findFirst({
        where: { accountId: newAccountId },
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.accountId).toEqual(newAccountId);
    });

    it('마지막 변경일로부터 30일이 지나지 않은 경우 예외가 발생한다', async () => {
      const updatedAt = new Date(2025, 1, 2);
      const user = generateUserEntity(
        'test@test.com',
        'account_id',
        '민수',
        'https://image.com',
        'GOOGLE',
        new Date(),
        updatedAt,
      );
      await db.user.create({ data: user });

      const today = new Date(2025, 1, 31);
      const newAccountId = 'new_id';

      await expect(
        async () =>
          await usersService.changeAccountId(user.id, newAccountId, today),
      ).rejects.toThrow(
        new UnprocessableEntityException(ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE(1)),
      );
    });

    it('프로필 사진 변경은 계정 아이디 변경에 영향을 주어선 안 된다', async () => {
      const createdAt = new Date(2025, 1, 1);
      const user = generateUserEntity(
        'test@test.com',
        'account_id',
        '민수',
        'https://image.com',
        'GOOGLE',
        createdAt,
        createdAt,
      );
      await db.user.create({ data: user });

      const today = new Date(2025, 1, 31);
      const newProfileImage = 'https://newimage.com';
      const newAccountId = 'new_id';

      await usersService.changeProfileImage(user.id, newProfileImage);
      await usersService.changeAccountId(user.id, newAccountId, today);
      const updatedUser = await db.user.findFirst({
        where: { accountId: newAccountId },
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.accountId).toEqual(newAccountId);
    });

    it('탈퇴한지 30일이 지나지 않은 동일한 아이디의 회원이 존재하는 경우 예외가 발생한다.', async () => {
      const user = generateUserEntity('test@test.com', 'account_id');
      await db.user.create({ data: user });

      const newAccountId = 'new_account_id';

      const deletedUser = generateUserEntity('test@test.com', newAccountId);
      await db.user.create({ data: deletedUser });
      await db.user.update({
        data: { deletedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) },
        where: { id: deletedUser.id },
      });

      await expect(
        async () => await usersService.changeAccountId(user.id, newAccountId),
      ).rejects.toThrow(new DuplicateAccountIdException());
    });
  });

  describe('회원 탈퇴', () => {
    it('탈퇴 시 회원은 삭제 처리되고 해당 회원의 모든 토큰이 삭제된다.', async () => {
      const user = await db.user.create({
        data: generateUserEntity('me@test.com', 'mememem'),
      });
      const refreshTokens = Array.from({ length: 5 }, (_, i) =>
        RefreshTokenEntity.create(
          { deviceId: `device${i}`, token: `token${i}`, userId: user.id },
          new Date(),
        ),
      );
      await db.refreshToken.createMany({ data: refreshTokens });

      await usersService.withdraw(user.id);
      const deletedTokens = await db.refreshToken.findMany();
      const deletedUser = (await db.user.findMany())[0];

      expect(deletedUser.deletedAt).not.toBeNull();
      expect(deletedTokens.length).toEqual(0);
    });
  });
});
