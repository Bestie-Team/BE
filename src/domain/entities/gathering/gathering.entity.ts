import { GatheringPrototype } from 'src/domain/types/gathering.types';
import { GatheringType } from 'src/shared/types';

export class GatheringEntity {
  constructor(
    readonly id: string,
    readonly type: GatheringType,
    readonly hostUserId: string,
    readonly name: string,
    readonly description: string,
    readonly gatheringDate: Date,
    readonly address: string,
    readonly invitationImageUrl: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(proto: GatheringPrototype, idGen: () => string, stdDate: Date) {
    return new GatheringEntity(
      idGen(),
      proto.type,
      proto.hostUserId,
      proto.name,
      proto.description,
      new Date(proto.gatheringDate),
      proto.address,
      proto.invitationImageUrl,
      stdDate,
      stdDate,
    );
  }
}
