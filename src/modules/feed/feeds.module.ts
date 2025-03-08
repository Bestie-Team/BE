import { Module } from '@nestjs/common';
import { FeedsController } from 'src/presentation/controllers/feed/feeds.controller';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { BlockedFeedsModule } from 'src/modules/feed/blocked-feeds.module';
import { FeedsService } from 'src/domain/services/feed/feeds.service';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { S3Module } from 'src/infrastructure/aws/s3/s3.module';

@Module({
  imports: [
    S3Module,
    BlockedFeedsModule,
    FeedsComponentModule,
    FriendsCheckerModule,
    GatheringsComponentModule,
    GatheringParticipationModules,
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
