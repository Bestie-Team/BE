import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterRequest } from 'src/presentation/dto/auth/register.request';
import { LoginResponse } from 'src/presentation/dto/auth/login.response';
import { ResponseResult } from '../helpers/types';

/**
 * 회원가입을 하고 access token을 반환하는 함수.
 * @param app 네스트 앱
 * @returns `Bearer ${accessToken}`
 */
export const login = async (app: INestApplication) => {
  const dto: RegisterRequest = {
    email: 'lighty@lighty.com',
    accountId: 'lighty',
    name: '라이티',
    profileImageUrl: 'https://image.com',
    provider: 'GOOGLE',
  };

  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto);
  const { body }: ResponseResult<LoginResponse> = response;

  return {
    accessToken: `Bearer ${body.accessToken}`,
    accountId: dto.accountId,
  };
};
