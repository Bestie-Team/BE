import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { notificationConverter } from 'src/presentation/converters/notification/notification.converters';
import { NotificationListRequest } from 'src/presentation/dto/notification/request/notification-list.request';
import { NotificationListResponse } from 'src/presentation/dto/notification/response/notification-list.response';

@ApiTags('/notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: '알림 목록 조회' })
  @ApiResponse({ status: 200, type: NotificationListResponse })
  @Get()
  async getNotifications(
    @Query() dto: NotificationListRequest,
    @CurrentUser() userId: string,
  ): Promise<NotificationListResponse> {
    const domain = await this.notificationsService.getAll(userId, dto);
    return notificationConverter.toListDto(domain);
  }
}
