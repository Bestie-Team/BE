import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';

export interface GroupParticipationsRepository {
  save(data: GroupParticipationEntity): Promise<void>;
  delete(groupId: string, participantId: string): Promise<void>;
}

export const GroupParticipationsRepository = Symbol(
  'GroupParticipationsRepository',
);
