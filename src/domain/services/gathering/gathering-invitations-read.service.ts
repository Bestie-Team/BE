import { Inject } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { getGatheringInvitationCursor } from 'src/domain/shared/get-cursor';
import { PaginationInput } from 'src/shared/types';

export class GatheringInvitationsReadService {
  constructor(
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  async getReceivedInvitations(
    userId: string,
    paginationInput: PaginationInput,
  ) {
    const { limit } = paginationInput;
    const invitations =
      await this.gatheringParticipationsRepository.findReceivedByParticipantId(
        userId,
        paginationInput,
      );
    const nextCursor = getGatheringInvitationCursor(invitations, limit);

    return {
      invitations,
      nextCursor,
    };
  }
}
