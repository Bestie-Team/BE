import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';
import { Event } from 'src/infrastructure/event/types';

@Injectable()
export class EventEmitterPublisher implements EventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish<K extends keyof Event>(eventName: K, payload: Event[K]): void {
    this.eventEmitter.emit(eventName, payload);
  }
}
