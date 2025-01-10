import { Module } from '@nestjs/common';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { GroupCreateService } from 'src/domain/services/group/group-create.service';
import { GroupsService } from 'src/domain/services/group/groups.service';
import { GroupParticipationsPrismaRepository } from 'src/infrastructure/repositories/group/group-participations-prisma.repository';
import { GroupsPrismaRepository } from 'src/infrastructure/repositories/group/groups-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GroupsController } from 'src/presentation/controllers/group/groups.controller';

@Module({
  imports: [FriendsModule],
  controllers: [GroupsController],
  providers: [
    GroupCreateService,
    GroupsService,
    { provide: GroupsRepository, useClass: GroupsPrismaRepository },
    {
      provide: GroupParticipationsRepository,
      useClass: GroupParticipationsPrismaRepository,
    },
  ],
  exports: [{ provide: GroupsRepository, useClass: GroupsPrismaRepository }],
})
export class GroupsModule {}
