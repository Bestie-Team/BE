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
