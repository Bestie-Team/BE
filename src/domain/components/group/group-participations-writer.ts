import { Inject, Injectable } from '@nestjs/common';
import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';

@Injectable()
export class GroupParticipationsWriter {
  constructor(
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
  ) {}

  async createMany(participations: GroupParticipationEntity[]) {
    await this.groupParticipationsRepository.saveMany(participations);
  }

  async delete(groupId: string, participantId: string) {
    {
      await this.groupParticipationsRepository.delete(groupId, participantId);
    }
  }
}
