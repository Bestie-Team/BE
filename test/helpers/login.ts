import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterRequest } from 'src/presentation/dto/auth/request/register.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';
import { ResponseResult } from '../helpers/types';

/**
 * 회원가입을 하고 access token을 반환하는 함수.
 * @param app 네스트 앱
 * @returns `Bearer ${accessToken}`
 */
export const login = async (app: INestApplication) => {
  const deviceId = 'deviceId123';
  const dto: RegisterRequest = {
    email: 'lighty@lighty.com',
    accountId: 'lighty',
    name: '라이티',
    profileImageUrl: 'https://image.com',
    provider: 'GOOGLE',
    termsOfServiceConsent: true,
    privacyPolicyConsent: true,
  };

  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .set('Device-ID', deviceId)
    .send(dto);
  const { body }: ResponseResult<LoginResponse> = response;

  return {
    accessToken: `Bearer ${body.accessToken}`,
    accountId: dto.accountId,
    deviceId,
  };
};
