import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'test' ? false : true,
  sameSite: 'none',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
};
