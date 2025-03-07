import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterPublisher } from 'src/infrastructure/event/publishers/event-emitter-publisher';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';

@Module({
  providers: [
    EventEmitter2,
    { provide: EventPublisher, useClass: EventEmitterPublisher },
  ],
  exports: [{ provide: EventPublisher, useClass: EventEmitterPublisher }],
})
export class EventModule {}
