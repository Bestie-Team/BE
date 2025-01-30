import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOT_FOUND_GATHERING_MESSAGE } from 'src/domain/error/messages';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { getGatheringCursor } from 'src/domain/helpers/get-cursor';
import {
  DateIdPaginationInput,
  PaginatedDateRangeInput,
} from 'src/shared/types';

@Injectable()
export class GatheringsReadService {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
  ) {}

  async getGatheringsWithoutFeed(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ) {
    const gatherings =
      await this.gatheringsRepository.findGatheringsWithoutFeedByUserId(
        userId,
        paginationInput,
      );
    const nextCursor = getGatheringCursor(gatherings, paginationInput.limit);

    return {
      gatherings,
      nextCursor,
    };
  }

  async getWaitingGatherings(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    return await this.getGatherings(userId, paginatedDateRangeInput, 'WAITING');
  }

  async getEndedGatherings(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    return await this.getGatherings(userId, paginatedDateRangeInput, 'ENDED');
  }

  async getGatherings(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
    type: 'WAITING' | 'ENDED',
  ) {
    const gatherings =
      type === 'WAITING'
        ? await this.gatheringsRepository.findByUserId(
            userId,
            paginatedDateRangeInput,
          )
        : await this.gatheringsRepository.findEndedGatheringsByUserId(
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

  async getDetail(gatheringId: string) {
    const gathering = await this.gatheringsRepository.findDetailById(
      gatheringId,
    );
    if (!gathering) {
      throw new NotFoundException(NOT_FOUND_GATHERING_MESSAGE);
    }

    return gathering;
  }
}
