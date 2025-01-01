import { IsString } from 'class-validator';

export class LoginRequest {
  @IsString()
  readonly accessToken: string;
}
