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
    readonly address: string,
    readonly invitationImageUrl: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly gatheringDate: Date,
  ) {}

  static create(
    proto: GatheringPrototype,
    idGen: () => string,
    stdDate: Date,
  ): GatheringEntity {
    return new GatheringEntity(
      idGen(),
      proto.type,
      proto.hostUserId,
      proto.groupId,
      proto.name,
      proto.description,
      proto.address,
      proto.invitationImageUrl,
      stdDate,
      stdDate,
      new Date(proto.gatheringDate),
    );
  }
}
