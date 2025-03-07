import { Inject, Injectable } from '@nestjs/common';
import { GroupEntity } from 'src/domain/entities/group/group.entity';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';

@Injectable()
export class GroupsWriter {
  constructor(
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
  ) {}

  async create(group: GroupEntity) {
    await this.groupsRepository.save(group);
  }

  async update(id: string, data: Partial<GroupEntity>) {
    await this.groupsRepository.update(id, data);
  }

  async delete(id: string) {
    await this.groupsRepository.delete(id);
  }
}
