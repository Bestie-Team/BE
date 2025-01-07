import { GroupEntity } from 'src/domain/entities/group/group.entity';

export interface GroupsRepository {
  save(data: GroupEntity): Promise<void>;
}

export const GroupsRepository = Symbol('GroupsRepository');
