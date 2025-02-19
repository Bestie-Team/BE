import { Event } from 'src/infrastructure/event/types';

export interface EventPublisher {
  publish<K extends keyof Event>(eventName: K, payload: Event[K]): void;
}

export const EventPublisher = Symbol('EventPublisher');
