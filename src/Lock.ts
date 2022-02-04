import { Lock as MinLock } from 'min-lock';

export class Lock {
  protected readonly lock = new MinLock();

  public async withLock<X>(callback: () => Promise<X>): Promise<X> {
    const releaser = await this.lock.acquire();
    try {
      return await callback();
    } finally {
      releaser();
    }
  }
}

export default Lock;
