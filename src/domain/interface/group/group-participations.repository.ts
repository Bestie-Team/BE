import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';

export interface GroupParticipationsRepository {
  save(data: GroupParticipationEntity): Promise<void>;
  saveMany(data: GroupParticipationEntity[]): Promise<void>;
  delete(groupId: string, participantId: string): Promise<void>;
  update(id: string, data: Partial<GroupParticipationEntity>): Promise<void>;
}

export const GroupParticipationsRepository = Symbol(
  'GroupParticipationsRepository',
);
