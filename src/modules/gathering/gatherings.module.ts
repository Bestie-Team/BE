import { Module } from '@nestjs/common';
import { GatheringsService } from 'src/domain/services/gathering/gatherings.service';
import { GatheringsController } from 'src/presentation/controllers/gathering/gatherings.controller';

@Module({
  controllers: [GatheringsController],
  providers: [GatheringsService],
})
export class GatheringsModule {}
