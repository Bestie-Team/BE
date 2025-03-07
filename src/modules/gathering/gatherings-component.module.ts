import { Module } from '@nestjs/common';
import { GatheringsReader } from 'src/domain/components/gathering/gatherings-reader';
import { GatheringsWriter } from 'src/domain/components/gathering/gatherings-writer';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringsPrismaRepository } from 'src/infrastructure/repositories/gathering/gatherings-prisma.repository';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';

@Module({
  imports: [FriendsCheckerModule],
  providers: [
    GatheringsWriter,
    GatheringsReader,
    { provide: GatheringsRepository, useClass: GatheringsPrismaRepository },
  ],
  exports: [GatheringsWriter, GatheringsReader],
})
export class GatheringsComponentModule {}
