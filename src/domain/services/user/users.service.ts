import { Transactional } from '@nestjs-cls/transactional';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { URLSearchParams } from 'node:url';
import { RefreshTokenWriter } from 'src/domain/components/token/refresh-token-writer';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import { DuplicateAccountIdException } from 'src/domain/error/exceptions/conflice.exception';
import { UserNotFoundException } from 'src/domain/error/exceptions/not-found.exception';
import { ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE } from 'src/domain/error/messages';
import { calcDateDiff } from 'src/utils/date';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersReader: UsersReader,
    private readonly usersWriter: UsersWriter,
    private readonly refreshTokenWriter: RefreshTokenWriter,
    private readonly jwtService: JwtService,
  ) {}

  async changeProfileImage(userId: string, profileImageUrl: string) {
    await this.usersWriter.updateProfileImage(userId, profileImageUrl);
  }

  async changeAccountId(userId: string, accountId: string, today = new Date()) {
    await this.checkAccountIdChangeCooldown(userId, today);
    await this.checkDuplicateAccountId(accountId);

    await this.usersWriter.updateAccountId(userId, accountId);
  }

  private async checkAccountIdChangeCooldown(userId: string, today: Date) {
    try {
      const { createdAt, updatedAt } = await this.usersReader.readOne(userId);

      const isSetFirst = createdAt.getTime() === updatedAt.getTime();
      const daysRemaining = calcDateDiff(today, updatedAt, 'd');
      if (!isSetFirst && daysRemaining < 30) {
        throw new UnprocessableEntityException(
          ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE(30 - daysRemaining),
        );
      }
    } catch (e: unknown) {
      throw e;
    }
  }

  async checkDuplicateAccountId(accountId: string, today = new Date()) {
    try {
      const { deletedAt } = await this.usersReader.readOneByAccountId(
        accountId,
      );
      if (deletedAt) {
        if (calcDateDiff(today, deletedAt, 'd') < 30) {
          throw new DuplicateAccountIdException();
        }
        return;
      }
      throw new DuplicateAccountIdException();
    } catch (e: unknown) {
      if (e instanceof UserNotFoundException) {
        return;
      }
      throw e;
    }
  }

  async withdraw(userId: string, authorizationCode?: string) {
    if (authorizationCode) {
      const clientSecret = this.generateAppleClientSecret();

      const params = new URLSearchParams();
      params.append('client_id', process.env.APPLE_CLIENT_ID!);
      params.append('client_secret', clientSecret);
      params.append('token', authorizationCode);
      params.append('token_type_hint', 'access_token');

      const revokeResponse = await fetch(
        'https://appleid.apple.com/auth/revoke',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        },
      );

      if (!revokeResponse.ok) throw new Error('리보크 실패');
    }

    await this.withdrawTransaction(userId);
  }

  @Transactional()
  async withdrawTransaction(userId: string) {
    await this.usersWriter.delete(userId);
    await this.refreshTokenWriter.deleteAll(userId);
  }

  // TODO 추후 다른 클래스로 위임 예정
  private generateAppleClientSecret(): string {
    const keyId = process.env.APPLE_KEY_ID;
    const teamId = process.env.APPLE_TEAM_ID;
    const clientId = process.env.APPLE_CLIENT_ID;

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: teamId,
      iat: now,
      exp: now + 3600 * 24 * 1,
      aud: 'https://appleid.apple.com',
      sub: clientId,
    };

    const privateKey = process.env.APPLE_PRIVATE_KEY;

    return this.jwtService.sign(payload, {
      algorithm: 'ES256',
      keyid: keyId,
      secret: privateKey,
    });
  }
}
