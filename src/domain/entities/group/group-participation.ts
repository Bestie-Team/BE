import { GroupParticipationStatus } from 'src/shared/types';

export class GroupParticipationEntity {
  constructor(
    readonly id: string,
    readonly groupId: string,
    readonly participantId: string,
    readonly createdAt: Date,
    readonly status?: GroupParticipationStatus,
  ) {}

  static create(
    input: { groupId: string; participantId: string },
    idGen: () => string,
    stdDate: Date,
  ) {
    return new GroupParticipationEntity(
      idGen(),
      input.groupId,
      input.participantId,
      stdDate,
    );
  }
}
