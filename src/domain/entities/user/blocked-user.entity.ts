export class BlockedUserEntity {
  constructor(
    readonly blockerId: string,
    readonly blockedId: string,
    readonly createdAt: Date,
  ) {}

  static create(
    proto: { blockerId: string; blockedId: string },
    stdDate: Date,
  ): BlockedUserEntity {
    return new BlockedUserEntity(proto.blockerId, proto.blockedId, stdDate);
  }
}
