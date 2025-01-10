import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';

export interface GatheringsRepository {
  save(data: GatheringEntity): Promise<void>;
}

export const GatheringsRepository = Symbol('GatheringRepository');
