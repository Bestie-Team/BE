import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterPublisher } from 'src/infrastructure/event/publishers/event-emitter-publisher';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';

@Module({
  imports: [EventEmitter2],
  providers: [{ provide: EventPublisher, useClass: EventEmitterPublisher }],
  exports: [{ provide: EventPublisher, useClass: EventEmitterPublisher }],
})
export class EventModule {}
