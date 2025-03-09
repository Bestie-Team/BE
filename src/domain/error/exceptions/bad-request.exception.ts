import { DomainException } from 'src/domain/error/exceptions/domain.exception';

export class BadRequestException extends DomainException {
  constructor(message: string, name = 'bad request') {
    super(message, name);
  }
}
