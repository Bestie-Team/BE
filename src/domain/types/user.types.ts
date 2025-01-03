import { Provider } from '../../shared/types';

export interface UserPrototype {
  readonly email: string;
  readonly name: string;
  readonly accountId: string;
  readonly profileImageUrl: string;
  readonly provider: Provider;
}

export interface UserBasicInfo {
  readonly id: string;
  readonly email: string;
  readonly provider: Provider;
}
