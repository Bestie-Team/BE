import { GatheringParticipationStatus } from 'src/shared/types';

export class GatheringParticipationEntity {
  constructor(
    readonly id: string,
    readonly gatheringId: string,
    readonly participantId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly status: GatheringParticipationStatus = 'PENDING',
  ) {}

  static create(
    proto: {
      gatheringId: string;
      participantId: string;
      status?: GatheringParticipationStatus;
    },
    idGen: () => string,
    stdDate: Date,
  ) {
    return new GatheringParticipationEntity(
      idGen(),
      proto.gatheringId,
      proto.participantId,
      stdDate,
      stdDate,
      proto.status,
    );
  }
}
