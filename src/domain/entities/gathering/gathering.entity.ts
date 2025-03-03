import { GatheringPrototype } from 'src/domain/types/gathering.types';
import { GatheringType } from 'src/shared/types';

export class GatheringEntity {
  constructor(
    readonly id: string,
    readonly type: GatheringType,
    readonly hostUserId: string,
    readonly groupId: string | null,
    readonly name: string,
    readonly description: string,
    readonly gatheringDate: Date,
    readonly address: string,
    readonly invitationImageUrl: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    proto: GatheringPrototype,
    idGen: () => string,
    stdDate: Date,
  ): GatheringEntity {
    const { gatheringDate, ...input } = proto;
    return {
      ...input,
      id: idGen(),
      gatheringDate: new Date(gatheringDate),
      createdAt: stdDate,
      updatedAt: stdDate,
    };
  }
}
