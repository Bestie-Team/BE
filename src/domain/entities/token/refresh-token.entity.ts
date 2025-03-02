export class RefreshTokenEntity {
  readonly userId: string;
  readonly deviceId: string;
  readonly token: string;
  readonly createdAt: Date;

  static create(
    prototype: { userId: string; deviceId: string; token: string },
    stdDate: Date,
  ): RefreshTokenEntity {
    return {
      ...prototype,
      createdAt: stdDate,
    };
  }
}
