import { Inject, Injectable } from '@nestjs/common';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { getGatheringCursor } from 'src/domain/helpers/get-cursor';
import {
  DateIdCursor,
  DateIdPaginationInput,
  PaginatedDateRangeInput,
} from 'src/shared/types';
import { EndedGathering, Gathering } from 'src/domain/types/gathering.types';
import { GatheringNotFoundException } from 'src/domain/error/exceptions/not-found.exception';

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

  async readAll(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    const gatherings = await this.gatheringsRepository.findAllByUserId(
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
      throw new GatheringNotFoundException();
    }

    return gathering;
  }

  async readOne(id: string) {
    const gathering = await this.gatheringsRepository.findOneById(id);
    if (!gathering) {
      throw new GatheringNotFoundException();
    }

    return gathering;
  }

  async readOneByIdAndHostId(id: string, hostId: string) {
    const gathering = await this.gatheringsRepository.findOneByIdAndHostId(
      id,
      hostId,
    );
    if (!gathering) {
      throw new GatheringNotFoundException();
    }

    return gathering;
  }
}
