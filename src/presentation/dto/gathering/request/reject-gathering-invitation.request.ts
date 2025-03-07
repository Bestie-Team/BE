import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RejectGatheringInvitationRequest {
  @ApiProperty({ example: 'uuid' })
  @IsUUID(4)
  readonly invitationId: string;
}
