import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';

export interface GatheringParticipationsRepository {
  save(data: GatheringParticipationEntity): Promise<void>;
}

export const GatheringParticipationsRepository = Symbol(
  'GatheringParticipationsRepository',
);
