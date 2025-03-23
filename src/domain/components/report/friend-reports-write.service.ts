import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { IS_NOT_FRIEND_RELATION_MESSAGE } from 'src/domain/error/messages';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { BlockedUsersRepository } from 'src/domain/interface/user/blocked-users.repository';

@Injectable()
export class FriendReportsWriteSerivce {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    @Inject(BlockedUsersRepository)
    private readonly blockedUsersRepository: BlockedUsersRepository,
    private readonly friendsReader: FriendsReader,
    private readonly friendsWriter: FriendsWriter,
    private readonly gatheringParticipationsWriter: GatheringInvitationsWriter,
  ) {}

  async report(prototype: ReportPrototype) {
    const { reporterId, reportedId } = prototype;
    const friendRelation = await this.friendsReader.readOne(
      reporterId,
      reportedId,
    );
    if (!friendRelation || friendRelation.status !== 'ACCEPTED') {
      throw new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }

    await this.reportTransaction(prototype);
  }

  @Transactional()
  private async reportTransaction(prototype: ReportPrototype) {
    const { reportedId, reporterId } = prototype;
    await this.deleteAllPendingGatheringInvitation(reporterId, reportedId);
    await this.saveReport(prototype);
    await this.blockedUsersRepository.save({
      blockerId: reporterId,
      blockedId: reportedId,
      createdAt: new Date(),
    });
    await this.friendsWriter.delete(reporterId, reportedId);
  }

  private async saveReport(prototype: ReportPrototype) {
    const stdDate = new Date();
    const report = ReportEntity.create(prototype, v4, stdDate);
    await this.reportsRepository.save(report);
  }

  private async deleteAllPendingGatheringInvitation(
    firstUserId: string,
    secondUserId: string,
  ) {
    return await this.gatheringParticipationsWriter.deletePending(
      firstUserId,
      secondUserId,
    );
  }
}
