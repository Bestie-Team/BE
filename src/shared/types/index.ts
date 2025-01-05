export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export interface PaginationInput {
  cursor: string;
  limit: number;
}
