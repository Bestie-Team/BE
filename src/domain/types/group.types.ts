import { User } from 'src/domain/types/user.types';

export interface GroupPrototype {
  readonly ownerId: string;
  readonly name: string;
  readonly description: string;
  readonly groupImageUrl: string;
}

export interface Group {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly gatheringCount: number;
  readonly groupImageUrl: string;
  readonly joinDate: Date;
  readonly owner: User;
  readonly members: User[];
}

export interface GroupDetail {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly gatheringCount: number;
  readonly groupImageUrl: string;
  readonly joinDate: Date;
  readonly owner: User;
  readonly members: User[];
}
