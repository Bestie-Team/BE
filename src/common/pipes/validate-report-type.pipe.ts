import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ValidateReportTypePipe implements PipeTransform {
  transform(value: any) {
    const provider = String(value).toUpperCase();
    if (provider !== 'FRIEND' && provider !== 'GROUP' && provider !== 'FEED') {
      throw new BadRequestException(`${value} 신고는 지원하지 않습니다.`);
    }

    return provider;
  }
}
