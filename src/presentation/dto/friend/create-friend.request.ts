import { IsUUID } from 'class-validator';

export class CreateFriendRequest {
  @IsUUID()
  readonly userId: string;
}
