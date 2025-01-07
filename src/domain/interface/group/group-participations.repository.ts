import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';

export interface GroupParticipationsRepository {
  save(data: GroupParticipationEntity): Promise<void>;
}

export const GroupParticipationsRepository = Symbol(
  'GroupParticipationsRepository',
);
