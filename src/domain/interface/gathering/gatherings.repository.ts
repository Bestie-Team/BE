import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { Gathering } from 'src/domain/types/gathering.types';
import { PaginatedDateRangeInput } from 'src/shared/types';

export interface GatheringsRepository {
  save(data: GatheringEntity): Promise<void>;
  findByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<Gathering[]>;
}

export const GatheringsRepository = Symbol('GatheringRepository');
