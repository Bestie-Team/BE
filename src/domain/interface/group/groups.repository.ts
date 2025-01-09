import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { Group } from 'src/domain/types/group.types';
import { PaginationInput } from 'src/shared/types';

export interface GroupsRepository {
  save(data: GroupEntity): Promise<void>;
  findGroupsByUserId(
    userId: string,
    paginationInput: PaginationInput,
  ): Promise<Group[]>;
}

export const GroupsRepository = Symbol('GroupsRepository');
