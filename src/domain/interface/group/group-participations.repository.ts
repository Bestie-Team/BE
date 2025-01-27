import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GroupParticipationStatus } from 'src/shared/types';

export interface GroupParticipationsRepository {
  save(data: GroupParticipationEntity): Promise<void>;
  saveMany(data: GroupParticipationEntity[]): Promise<void>;
  findByUserIds(
    userIds: string[],
  ): Promise<{ id: string; status: GroupParticipationStatus }[]>;
  delete(groupId: string, participantId: string): Promise<void>;
  update(id: string, data: Partial<GroupParticipationEntity>): Promise<void>;
}

export const GroupParticipationsRepository = Symbol(
  'GroupParticipationsRepository',
);
