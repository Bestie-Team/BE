import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationStatues } from 'src/shared/types';

export interface GatheringParticipationsRepository {
  save(data: GatheringParticipationEntity): Promise<void>;
  findOneByIdAndParticipantId(
    id: string,
    participantId: string,
  ): Promise<{ id: string } | null>;
  findByParticipantId(): Promise<any>;
  updateStatus(
    invitationId: string,
    status: GatheringParticipationStatues,
  ): Promise<void>;
  delete(invitationId: string): Promise<void>;
}

export const GatheringParticipationsRepository = Symbol(
  'GatheringParticipationsRepository',
);
