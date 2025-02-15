import { EventEmitter } from "events";

type EventMap = {
  [event: string]: (...args: unknown[]) => unknown;
};

export class TEventEmitter<Events extends EventMap> {
  private emitter = new EventEmitter();

  on<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.emitter.on(event as string, listener);
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.emitter.off(event as string, listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.emitter.emit(event as string, ...args);
  }
}
