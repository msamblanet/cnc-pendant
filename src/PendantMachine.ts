import { openPromisified, PromisifiedBus } from 'i2c-bus';
import rpio from 'rpio';
import { INA226, CONFIGURATION_REGISTER as INA226_CONFIG_REGISTER } from 'ina226';
import { BaseStateMachine, BaseState } from './BaseStateMachine.js';
import { Led, PushButton, RotaryEncoder, Interupt, TCA9548A } from './devices/index.js';

export class PendantMachine extends BaseStateMachine<BasePendantState> {

  public static AXES = ['X', 'Y', 'Z', 'A'];
  public static MODES = ['X', 'Y', 'Z', 'A', 'Macro'];
  public static RATES = ['Coarse', 'Medium', 'Fine', 'X-Fine'];

  protected readonly confirm = false;
  protected readonly macro = 0;
  protected readonly rate = 0;
  protected readonly lastAxis = 0;
  protected greenLed?: Led;
  protected redLed?: Led;
  protected okButton?: PushButton;
  protected modeButton?: PushButton;
  protected rateButton?: PushButton;
  protected estopButton?: PushButton;
  protected jogWheel?: RotaryEncoder;
  protected modeWheel?: RotaryEncoder;
  protected rateWheel?: RotaryEncoder;
  protected ina226Interrupt?: Interupt;
  protected tca9548a?: TCA9548A;
  protected i2cBus?: PromisifiedBus;
  protected ina226?: INA226;

  public constructor() {
    super();
  }

  protected async initDevices(): Promise<void> {
    // Init RPIO
    rpio.init({ mapping: 'gpio', close_on_exit: false });

    // Init controls
    this.greenLed = new Led(27);
    this.redLed = new Led(17);
    this.okButton = new PushButton(0);
    this.modeButton = new PushButton(5);
    this.rateButton = new PushButton(6);
    this.estopButton = new PushButton(13);
    this.modeWheel = new RotaryEncoder(14, 15, PendantMachine.MODES.length);
    this.rateWheel = new RotaryEncoder(23, 24, PendantMachine.RATES.length);
    this.jogWheel = new RotaryEncoder(25, 8, 65535);
    this.ina226Interrupt = new Interupt(14);

    // Init I2C bus and the TCA9548A I2C mux
    // Requires that I2C is enabled in /boot/config.txt
    // I2C configuration (pin remaps, baud rate, etc) are also done there...
    this.i2cBus = await openPromisified(0);
    this.tca9548a = new TCA9548A({ bus: this.i2cBus });

    // Init displays
    await this.tca9548a.withPort(0, async () => {}); // @todo IMPLEMENT
    await this.tca9548a.withPort(1, async () => {}); // @todo IMPLEMENT

    // Init INA225
    this.ina226 = new INA226(this.i2cBus.bus(), 0x40);
    this.ina226.writeRegister(INA226_CONFIG_REGISTER, 0x4427); // 0x4427 means 16 averages, 1.1ms conversion time, shunt and bus continuous

    // Map events for controls
    this.jogWheel.on(RotaryEncoder.CHANGE, (val: number, delta: number) => {
      this.state?.onJogChange(val, delta);
    });
    this.modeWheel.on(RotaryEncoder.CHANGE, (val: number, delta: number) => {
      this.state?.onModeChange(val, delta);
    });
    this.rateWheel.on(RotaryEncoder.CHANGE, (val: number, delta: number) => {
      this.state?.onRateChange(val, delta);
    });
    this.okButton.on(PushButton.DOWN, () => {
      this.state?.onOkChange(true);
    });
    this.okButton.on(PushButton.UP, () => {
      this.state?.onOkChange(false);
    });
    this.okButton.on(PushButton.CLICK, () => {
      this.state?.onOkClick();
    });
    this.modeWheel.on(PushButton.CLICK, () => {
      this.state?.onModeClick();
    });
    this.rateWheel.on(PushButton.CLICK, () => {
      this.state?.onRateClick();
    });
    this.estopButton.on(PushButton.DOWN, () => {
      this.state?.onEStopChange(true);
    });
    this.estopButton.on(PushButton.UP, () => {
      this.state?.onEStopChange(false);
    });

    // Hook into ina226Interrupt
    this.ina226Interrupt.on(Interupt.INTERUPT, () => {
      this.onINA226Interrupt();
    });
}

  protected async initStates(): Promise<void> {
  }

  protected destroyStates(): void {
  }

  protected destroyDevices(): void {
    this.greenLed?.close();
    this.redLed?.close();
    this.okButton?.close();
    this.modeButton?.close();
    this.rateButton?.close();
    this.estopButton?.close();
    this.modeWheel?.close();
    this.rateWheel?.close();
    this.jogWheel?.close();
    this.ina226Interrupt?.close();
    rpio.exit();
  }

  public async getOkState(): Promise<boolean> {
    return rpio.read(0) === rpio.HIGH ? false : true;
  }
  public async getEStopState(): Promise<boolean> {
    return rpio.read(13) === rpio.HIGH ? false : true;
  }
  public async setGreeLed(on: boolean): Promise<void> {
    rpio.write(27, on ? rpio.HIGH : rpio.LOW);
  }
  public async setRedLed(on: boolean): Promise<void> {
    rpio.write(17, on ? rpio.HIGH : rpio.LOW);
  }

  public async updateModeDisplay(): Promise<void> {}
  public async updateStateDisplay(): Promise<void> {}

  public async queueCncCommand(cmd: string): Promise<void> {}

  protected onINA226Interrupt(): void {}
}

export class BasePendantState extends BaseState<PendantMachine> {

  public constructor(machine: PendantMachine) {
    super(machine);
  }

  public async init(): Promise<void> {
  }
  public async onSet(): Promise<void> {
  }
  public async onUnset(): Promise<void> {
  }
  public destroy(): void {
  }

  public async onJogChange(val: number, delta: number): Promise<void> {}
  public async onModeChange(val: number, delta: number): Promise<void> {}
  public async onRateChange(val: number, delta: number): Promise<void> {}
  public async onOkChange(down: boolean): Promise<void> {}
  public async onOkClick(): Promise<void> {}
  public async onModeClick(): Promise<void> {}
  public async onRateClick(): Promise<void> {}
  public async onEStopChange(down: boolean): Promise<void> {
    if (down) {
      await this.machine.setState('estop');
    }
  }
}
