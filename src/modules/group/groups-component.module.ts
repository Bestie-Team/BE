import { Module } from '@nestjs/common';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GroupsWriter } from 'src/domain/components/group/groups-writer';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { GroupsPrismaRepository } from 'src/infrastructure/repositories/group/groups-prisma.repository';

@Module({
  providers: [
    GroupsWriter,
    GroupsReader,
    { provide: GroupsRepository, useClass: GroupsPrismaRepository },
  ],
  exports: [GroupsWriter, GroupsReader],
})
export class GroupsComponentModule {}
