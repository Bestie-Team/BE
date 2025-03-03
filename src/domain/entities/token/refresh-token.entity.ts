import { RefreshTokenPrototype } from 'src/domain/types/auth.types';

export class RefreshTokenEntity {
  readonly userId: string;
  readonly deviceId: string;
  readonly token: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static create(
    prototype: RefreshTokenPrototype,
    stdDate: Date,
    updatedAt?: Date,
  ): RefreshTokenEntity {
    return {
      ...prototype,
      createdAt: stdDate,
      updatedAt: updatedAt || stdDate,
    };
  }
}
