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
    return {
      ...proto,
      id: idGen(),
      createdAt: stdDate,
    };
  }
}
