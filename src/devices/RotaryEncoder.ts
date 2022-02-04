import { EventEmitter } from 'node:events';
import { Gpio as GPIO, BinaryValue } from 'onoff';
import rpio from 'rpio';

export class RotaryEncoder extends EventEmitter {
  public static readonly CHANGE = 'CHANGE';

  protected readonly positions: number;
  protected readonly gpioA: GPIO;
  protected readonly gpioB: GPIO;
  protected value = 0;
  protected prevA?: BinaryValue;
  protected secondTurn = false;

  public constructor(pinA: number, pinB: number, positions: number) {
    super();

    this.positions = positions;

    rpio.open(pinA, rpio.INPUT, rpio.PULL_UP);
    rpio.open(pinB, rpio.INPUT, rpio.PULL_UP);

    this.gpioA = new GPIO(pinA, 'in', 'both');
    this.gpioB = new GPIO(pinB, 'in', 'both');

    this.gpioA.watch(this.onChangeA.bind(this));
  }


  public currentValue(): number {
    return this.value;
  }

  public reset(): void {
    this.value = 0;
  }

  public close() {
    this.gpioA.unexport();
    this.gpioB.unexport();
  }

  protected onChangeA(err: unknown, aValue: BinaryValue): void {
    if (err) {
      throw err;
    }

    const bValue = this.gpioB.readSync();
    if (this.prevA !== aValue && this.secondTurn) {
      this.secondTurn = false;
      const delta = (aValue !== bValue) ? 1 : -1;
      this.value = (this.value + delta) % this.positions;
      this.emit(RotaryEncoder.CHANGE, this.value, delta)
    } else {
      this.secondTurn = true;
    }
    this.prevA = aValue;
  }
}

export default RotaryEncoder;
