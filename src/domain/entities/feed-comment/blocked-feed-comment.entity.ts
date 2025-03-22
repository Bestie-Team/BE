export class BlockedFeedCommentEntity {
  constructor(
    readonly userId: string,
    readonly commentId: string,
    readonly createdAt: Date,
  ) {}

  static create(proto: { userId: string; commentId: string }, stdDate: Date) {
    return new BlockedFeedCommentEntity(proto.userId, proto.commentId, stdDate);
  }
}
