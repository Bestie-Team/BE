import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';

@Injectable()
export class GatheringInvitationsWriteService {
  constructor(
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  createGatheringInvitations(gatheringId: string, userIds: string[]) {
    const stdDate = new Date();
    return userIds.map((participantId) =>
      GatheringParticipationEntity.create(
        {
          gatheringId,
          participantId,
        },
        v4,
        stdDate,
      ),
    );
  }

  async createMany(participations: GatheringParticipationEntity[]) {
    await this.gatheringParticipationsRepository.saveMany(participations);
  }
}
