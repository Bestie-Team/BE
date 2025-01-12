import { Inject } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { getGatheringInvitationCursor } from 'src/domain/shared/get-cursor';
import { PaginatedDateRangeInput } from 'src/shared/types';

export class GatheringInvitationsReadService {
  constructor(
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  async getReceivedInvitations(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    return await this.getInvitations(
      userId,
      paginatedDateRangeInput,
      'RECEIVED',
    );
  }

  async getSentInvitations(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    return await this.getInvitations(userId, paginatedDateRangeInput, 'SENT');
  }

  private async getInvitations(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
    type: 'SENT' | 'RECEIVED',
  ) {
    const { limit } = paginatedDateRangeInput;
    const invitations =
      type === 'SENT'
        ? await this.gatheringParticipationsRepository.findSentBySenderId(
            userId,
            paginatedDateRangeInput,
          )
        : await this.gatheringParticipationsRepository.findReceivedByParticipantId(
            userId,
            paginatedDateRangeInput,
          );
    const nextCursor = getGatheringInvitationCursor(invitations, limit);

    return {
      invitations,
      nextCursor,
    };
  }
}
