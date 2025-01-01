import { Provider } from '../../shared/types';

export interface UserBasicInfo {
  readonly id: string;
  readonly email: string;
  readonly provider: Provider;
}
