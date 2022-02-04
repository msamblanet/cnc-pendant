import { EventEmitter } from 'node:events';
import { Gpio as GPIO, BinaryValue } from 'onoff';
import rpio from 'rpio';

export class PushButton extends EventEmitter {
  public static readonly UP = 'UP';
  public static readonly DOWN = 'DOWN';
  public static readonly CLICK = 'CLICK';

  protected readonly gpio: GPIO;
  protected readonly activeValue: BinaryValue;
  protected downAt?: number;


  public constructor(pin: number, activeLow = true) {
    super();

    this.activeValue = activeLow ? GPIO.LOW : GPIO.HIGH;

    rpio.open(pin, rpio.INPUT, activeLow ? rpio.PULL_UP : rpio.PULL_DOWN);

    this.gpio = new GPIO(pin, 'in', 'both', { debounceTimeout: 10 } );
    this.gpio.watch(this.onChange.bind(this));
  }

  public isPressed(): boolean {
    return this.downAt !== undefined;
  }

  public reset(): void {
    this.downAt = undefined;
  }

  public close() {
    this.gpio.unexport();
  }

  protected onChange(err: unknown, val: BinaryValue) {
    if (val === this.activeValue) {
      this.downAt = Date.now();
      this.emit(PushButton.DOWN);
    } else {
      // If this is an up soon enough after a down, consider it a click
      if (this.downAt && (Date.now() - this.downAt) < 1000) {
        this.emit(PushButton.CLICK);
      }

      this.downAt = undefined;
      this.emit(PushButton.UP);
    }
  }
}

export default PushButton;
