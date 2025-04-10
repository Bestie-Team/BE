import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { Group, GroupDetail } from 'src/domain/types/group.types';
import { PaginationInput } from 'src/shared/types';

export interface GroupsRepository {
  save(data: GroupEntity): Promise<void>;
  findGroupsByUserId(
    userId: string,
    paginationInput: PaginationInput,
  ): Promise<Group[]>;
  findOneById(id: string): Promise<{ id: string } | null>;
  findOneByGroupAndOwnerId(
    groupId: string,
    ownerId: string,
  ): Promise<{ id: string } | null>;
  findDetailById(id: string): Promise<GroupDetail | null>;
  update(id: string, data: Partial<GroupEntity>): Promise<void>;
  delete(groupId: string): Promise<void>;
}

export const GroupsRepository = Symbol('GroupsRepository');
