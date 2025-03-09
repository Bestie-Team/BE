export class DomainException extends Error {
  constructor(message: string, name = 'domain exception') {
    super(message);
    this.name = name;
  }
}
