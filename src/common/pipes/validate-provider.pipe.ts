import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ValidateProviderPipe implements PipeTransform {
  transform(value: any) {
    const provider = value.toUpperCase();
    if (provider !== 'GOOGLE' && provider !== 'APPLE' && provider !== 'KAKAO') {
      throw new BadRequestException(`${provider} 로그인은 지원하지 않습니다.`);
    }

    return provider;
  }
}
