import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import {
  EndedGathering,
  Gathering,
  GatheringDetail,
} from 'src/domain/types/gathering.types';
import {
  DateIdPaginationInput,
  PaginatedDateRangeInput,
} from 'src/shared/types';

export interface GatheringsRepository {
  save(data: GatheringEntity): Promise<void>;
  findByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<Gathering[]>;
  findEndedGatheringsByUserId(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<EndedGathering[]>;
  findGatheringsWithoutFeedByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Gathering[]>;
  findDetailById(id: string): Promise<GatheringDetail | null>;
  findOneByIdAndHostId(
    id: string,
    hostId: string,
  ): Promise<{ id: string; endedAt: Date | null } | null>;
  findOneById(
    id: string,
  ): Promise<{ id: string; hostUserId: string; endedAt: Date | null } | null>;
  update(id: string, data: Partial<GatheringEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}

export const GatheringsRepository = Symbol('GatheringRepository');
