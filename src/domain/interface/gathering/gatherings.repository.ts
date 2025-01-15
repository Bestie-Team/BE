import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { Gathering, GatheringDetail } from 'src/domain/types/gathering.types';
import { PaginatedDateRangeInput } from 'src/shared/types';

export interface GatheringsRepository {
  save(data: GatheringEntity): Promise<void>;
  findByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<Gathering[]>;
  findDetailById(id: string): Promise<GatheringDetail | null>;
  findOneById(id: string): Promise<{ id: string; endedAt: Date | null } | null>;
}

export const GatheringsRepository = Symbol('GatheringRepository');
