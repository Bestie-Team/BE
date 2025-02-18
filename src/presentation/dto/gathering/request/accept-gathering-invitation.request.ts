import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AcceptGatheringInvitationRequest {
  @ApiProperty({ example: 'uuid' })
  @IsUUID(4)
  readonly invitationId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID(4)
  readonly gatheringId: string;
}
