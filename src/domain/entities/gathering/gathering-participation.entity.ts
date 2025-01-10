export class GatheringParticipationEntity {
  constructor(
    readonly id: string,
    readonly gatheringId: string,
    readonly participantId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    proto: { gatheringId: string; participantId: string },
    idGen: () => string,
    stdDate: Date,
  ) {
    return new GatheringParticipationEntity(
      idGen(),
      proto.gatheringId,
      proto.participantId,
      stdDate,
      stdDate,
    );
  }
}
