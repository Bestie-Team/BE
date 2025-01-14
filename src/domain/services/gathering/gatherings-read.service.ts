import { Inject, Injectable } from '@nestjs/common';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { getGatheringCursor } from 'src/domain/shared/get-cursor';
import { PaginatedDateRangeInput } from 'src/shared/types';

@Injectable()
export class GatheringsReadService {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
  ) {}

  async getGatherings(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    const gatherings = await this.gatheringsRepository.findByUserId(
      userId,
      paginatedDateRangeInput,
    );
    const nextCursor = getGatheringCursor(
      gatherings,
      paginatedDateRangeInput.limit,
    );

    return {
      gatherings,
      nextCursor,
    };
  }
}
