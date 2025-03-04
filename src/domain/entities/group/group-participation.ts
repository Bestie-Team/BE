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
    proto: {
      groupId: string;
      participantId: string;
      status?: GroupParticipationStatus;
    },
    idGen: () => string,
    stdDate: Date,
  ): GroupParticipationEntity {
    return new GroupParticipationEntity(
      idGen(),
      proto.groupId,
      proto.participantId,
      stdDate,
      proto.status,
    );
  }
}
