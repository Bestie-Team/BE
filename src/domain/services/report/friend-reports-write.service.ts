import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';
import { ReportEntity } from 'src/domain/entities/report/report.entity';
import { IS_NOT_FRIEND_RELATION_MESSAGE } from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { ReportsRepository } from 'src/domain/interface/report/reports.repository';
import { ReportPrototype } from 'src/domain/types/report.types';

@Injectable()
export class FriendReportsWriteSerivce {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  async report(prototype: ReportPrototype) {
    const { reporterId, reportedId } = prototype;
    const friendRelation =
      await this.friendsRepository.findOneBySenderAndReceiverId(
        reporterId,
        reportedId,
      );
    if (!friendRelation || friendRelation.status !== 'ACCEPTED') {
      throw new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }

    await this.reportTransaction(prototype, friendRelation.id);
  }

  @Transactional()
  private async reportTransaction(
    prototype: ReportPrototype,
    friendRelationId: string,
  ) {
    const { reportedId, reporterId } = prototype;
    await this.deleteAllPendingGatheringInvitation(reporterId, reportedId);
    await this.saveReport(prototype);
    await this.friendsRepository.update(friendRelationId, {
      status: 'REPORTED',
    });
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
    return await this.gatheringParticipationsRepository.deleteAllPendingInvitation(
      firstUserId,
      secondUserId,
    );
  }
}
