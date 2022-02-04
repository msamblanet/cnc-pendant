/* eslint-disable unicorn/filename-case */
import assert from 'node:assert';
import retry from 'promise-fn-retry';
import { PromisifiedBus } from 'i2c-bus';
import { Lock } from '../util/Lock.js';

export interface Options {
  bus: PromisifiedBus;
  addr: number;
  cmdByte: number;
  retries: number;
  retryDelay: number;
}

export class TCA9548A {
  protected readonly bus: PromisifiedBus;
  protected readonly addr: number;
  protected readonly cmdByte: number;
  protected readonly retries: number;
  protected readonly retryDelay: number;
  protected readonly lock = new Lock();

  public constructor({ bus, addr, cmdByte, retries, retryDelay }: Partial<Options>) {
    assert(bus);
    this.bus = bus;
    this.addr = addr ?? 0x70;
    this.cmdByte = cmdByte ?? 1;
    this.retries = retries ?? 5;
    this.retryDelay = retryDelay ?? 1;
  }

  public async withPort<X>(port: number, callback: () => Promise<X>): Promise<X> {
    assert(port >= 0 && port <= 7);

    return this.lock.withLock(async () => {
      await this.setPorts(1 << port); // eslint-disable-line no-bitwise
      return callback();
    });
  }

  public async withAllPorts<X>(callback: () => Promise<X>): Promise<X> {
    return this.lock.withLock(async () => {
      await this.setPorts(255);
      return callback();
    });
  }

  public async allPortsOff(): Promise<void> {
    return this.lock.withLock(async () => this.setPorts(0));
  }

  protected async setPorts(portMask: number): Promise<void> {
    return this.sendByteWithRetry(portMask);
  }

  protected async sendByteWithRetry(value: number): Promise<void> {
    // Is this retry really needed?  Seems overkill but leaving in as
    // https://github.com/coreymjacobs/tca9548a/blob/master/tca9548a.js
    // seems to think it is needed
    return retry(
      async () => this.bus.writeByte(this.addr, this.cmdByte, value),
      {
        times: this.retries,
        initialDelayTime: this.retryDelay,
        onRetry: (error: unknown) => {
          console.log('TCA9548A Retry', error);
        }
      }
    );
  }
}
