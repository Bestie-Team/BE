export interface FriendPrototype {
  readonly senderId: string;
  readonly receiverId: string;
}

export interface FriendRequest {
  readonly id: string;
  readonly sender: User;
}

interface User {
  readonly id: string;
  readonly accountId: string;
  readonly name: string;
  readonly profileImageUrl: string;
}
