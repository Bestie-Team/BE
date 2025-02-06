import { User } from 'src/domain/types/user.types';
import { GatheringType } from 'src/shared/types';

export interface GatheringPrototype {
  readonly hostUserId: string;
  readonly name: string;
  readonly description: string;
  readonly type: GatheringType;
  readonly groupId: string | null;
  readonly gatheringDate: string;
  readonly address: string;
  readonly invitationImageUrl: string;
}

export interface Gathering {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly gatheringDate: Date;
  readonly invitationImageUrl: string;
}

export interface GatheringDetail extends Gathering {
  readonly description: string;
  readonly address: string;
  readonly hostUser: User;
  readonly members: User[];
}

export interface GatheringInvitation {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sender: string;
  readonly createdAt: Date;
  readonly gatheringDate: Date;
  readonly address: string;
  readonly invitation_image_url: string;
  readonly groupName: string | null;
  readonly members: User[];
}

export interface UpdateInput {
  readonly name: string;
  readonly description: string;
  readonly gatheringDate: string;
  readonly address: string;
}
