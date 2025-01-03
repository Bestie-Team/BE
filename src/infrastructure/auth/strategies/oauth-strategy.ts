import { Provider } from '../../../shared/types';

export interface OauthStrategy {
  getUserInfo(token: string): Promise<OauthUserInfo>;
}

export interface OauthUserInfo {
  email: string;
  name: string;
  provider: Provider;
}
