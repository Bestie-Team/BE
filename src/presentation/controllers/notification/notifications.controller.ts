import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { notificationConverter } from 'src/presentation/converters/notification/notification.converters';
import { NotificationListRequest } from 'src/presentation/dto/notification/request/notification-list.request';
import { NotificationListResponse } from 'src/presentation/dto/notification/response/notification-list.response';

@ApiTags('/notifications')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
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

  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  @ApiResponse({
    status: 204,
    description: '읽음 처리 완료.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('read')
  async readAll(@CurrentUser() userId: string) {
    await this.notificationsService.readAll(userId);
  }

  @ApiOperation({ summary: '알림 전체 삭제' })
  @ApiResponse({
    status: 204,
    description: '알림 전체 삭제 완료',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all')
  async deleteAll(@CurrentUser() userId: string) {
    await this.notificationsService.deleteAll(userId);
  }

  @ApiOperation({ summary: '알림 삭제' })
  @ApiResponse({
    status: 204,
    description: '알림 삭제 완료',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.notificationsService.delete(id);
  }
}
