import { EventEmitter } from 'node:events';
import { Gpio as GPIO, BinaryValue } from 'onoff';
import rpio from 'rpio';

export class Interupt extends EventEmitter {
  public static readonly INTERUPT = 'INTERUPT';

  protected readonly gpio: GPIO;

  public constructor(pin: number, activeLow = true) {
    super();

    rpio.open(pin, rpio.INPUT, activeLow ? rpio.PULL_UP : rpio.PULL_DOWN);

    this.gpio = new GPIO(pin, 'in', activeLow ? "falling" : "rising", { debounceTimeout: 10 } );
    this.gpio.watch(this.onChange.bind(this));
  }

  public close() {
    this.gpio.unexport();
  }

  protected onChange(err: unknown, val: BinaryValue) {
    if (val === GPIO.LOW) {
      this.emit(Interupt.INTERUPT);
    }
  }
}

export default Interupt;
