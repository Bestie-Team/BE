import { RefreshTokenPrototype } from 'src/domain/types/auth.types';

export class RefreshTokenEntity {
  constructor(
    readonly userId: string,
    readonly deviceId: string,
    readonly token: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    proto: RefreshTokenPrototype,
    stdDate: Date,
    updatedAt?: Date,
  ): RefreshTokenEntity {
    return new RefreshTokenEntity(
      proto.userId,
      proto.deviceId,
      proto.token,
      stdDate,
      updatedAt || stdDate,
    );
  }
}
