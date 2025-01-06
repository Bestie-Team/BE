import { FriendPrototype } from 'src/domain/types/friend.types';
import { FriendStatus } from 'src/shared/types';

export class FriendEntity {
  constructor(
    readonly id: string,
    readonly senderId: string,
    readonly receiverId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly status?: FriendStatus,
  ) {}

  static create(input: FriendPrototype, idGen: () => string, stdDate: Date) {
    return new FriendEntity(
      idGen(),
      input.senderId,
      input.receiverId,
      stdDate,
      stdDate,
    );
  }
}
