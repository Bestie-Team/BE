import { GatheringInvitation } from 'src/domain/types/gathering.types';
import { GatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/gathering-invitation-list.response';

export const gatheringInvitationConverter = {
  toListDto: ({
    invitations,
    nextCursor,
  }: {
    invitations: GatheringInvitation[];
    nextCursor: string | null;
  }): GatheringInvitationListResponse => {
    return {
      invitations: invitations.map((invitation) => ({
        ...invitation,
        gatheringDate: invitation.gatheringDate.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
      })),
      nextCursor,
    };
  },
};
