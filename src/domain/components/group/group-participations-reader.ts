import { Inject, Injectable } from '@nestjs/common';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';

@Injectable()
export class GroupParticipationsReader {
  constructor(
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
  ) {}

  async readMulti(userIds: string[]) {
    return this.groupParticipationsRepository.findByUserIds(userIds);
  }
}
