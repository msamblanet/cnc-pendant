import { Gpio as GPIO } from 'onoff';
import rpio from 'rpio';

export class Led {
  protected readonly gpio: GPIO;
  protected readonly activeHigh: boolean;

  public constructor(pin: number, activeHigh = true) {
    rpio.open(pin, rpio.OUTPUT, activeHigh ? rpio.LOW : rpio.HIGH);
    this.gpio = new GPIO(pin, 'out');
    this.activeHigh = activeHigh;
  }

  public async set(lit: true): Promise<void> {
    await this.gpio.write((this.activeHigh ? lit : !lit) ? GPIO.HIGH : GPIO.LOW);
  }

  public close() {
    this.gpio.unexport();
  }
}

export default Led;
