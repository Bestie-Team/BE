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

  static create(
    proto: FriendPrototype,
    idGen: () => string,
    stdDate: Date,
  ): FriendEntity {
    return {
      ...proto,
      id: idGen(),
      createdAt: stdDate,
      updatedAt: stdDate,
    };
  }
}
