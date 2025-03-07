import { User } from 'src/domain/types/user.types';

export interface FriendPrototype {
  readonly senderId: string;
  readonly receiverId: string;
}

export interface FriendRequest {
  readonly id: string;
  readonly sender: User;
}
