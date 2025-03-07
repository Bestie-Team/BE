import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOT_FOUND_GATHERING_MESSAGE } from 'src/domain/error/messages';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { getGatheringCursor } from 'src/domain/helpers/get-cursor';
import {
  DateIdCursor,
  DateIdPaginationInput,
  PaginatedDateRangeInput,
} from 'src/shared/types';
import { EndedGathering, Gathering } from 'src/domain/types/gathering.types';

@Injectable()
export class GatheringsReader {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
  ) {}

  async readUnwrittenFeed(
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

  async read(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<{
    gatherings: Gathering[];
    nextCursor: DateIdCursor | null;
  }> {
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

  async readEnded(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ): Promise<{
    gatherings: EndedGathering[];
    nextCursor: DateIdCursor | null;
  }> {
    const gatherings =
      await this.gatheringsRepository.findEndedGatheringsByUserId(
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

  private async getGatherings(
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

  async readDetail(gatheringId: string) {
    const gathering = await this.gatheringsRepository.findDetailById(
      gatheringId,
    );
    if (!gathering) {
      throw new NotFoundException(NOT_FOUND_GATHERING_MESSAGE);
    }
    return gathering;
  }

  async readOne(id: string) {
    const gathering = await this.gatheringsRepository.findOneById(id);

    if (!gathering) {
      throw new NotFoundException(NOT_FOUND_GATHERING_MESSAGE);
    }
    return gathering;
  }

  async readOneByIdAndHostId(id: string, hostId: string) {
    const gathering = await this.gatheringsRepository.findOneByIdAndHostId(
      id,
      hostId,
    );

    if (!gathering) {
      throw new NotFoundException(NOT_FOUND_GATHERING_MESSAGE);
    }
    return gathering;
  }
}
