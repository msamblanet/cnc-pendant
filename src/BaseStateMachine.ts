import assert from 'node:assert';

export interface BaseStateMachineInterface {
  setState(newState: string | number): Promise<void>;
  init(): Promise<void>;
  destroy(): void;
}

export interface BaseStateInterface {
  init(): Promise<void>;
  onSet(): Promise<void>;
  onUnset(): Promise<void>;
  destroy(): void;
}

export abstract class BaseStateMachine<StateType extends BaseStateInterface> {
  protected readonly states = new Map<string | number, StateType>();
  protected state?: StateType;

  public async setState(newState: string | number): Promise<void> {
    const nextState = this.states.get(newState);
    assert(nextState);

    if (nextState === this.state) {
      return;
    }

    await this.state?.onUnset();
    this.state = nextState;
    await this.state.onSet();
  }

  // Lifecycle methods
  public async init(): Promise<void> {
    await this.initDevices();
    await this.initStates();
    await this.setState(0);
  }

  public destroy(): void {
    this.destroyStates();
    this.destroyDevices();
  }

  protected abstract initDevices(): Promise<void>;
  protected abstract initStates(): Promise<void>;
  protected abstract destroyStates(): void;
  protected abstract destroyDevices(): void;
}

export abstract class BaseState<MachineType extends BaseStateMachineInterface> implements BaseStateInterface {
  protected readonly machine: MachineType;

  public constructor(machine: MachineType) {
    this.machine = machine;
  }

  // Lifecycle methods
  abstract init(): Promise<void>;
  abstract onSet(): Promise<void>;
  abstract onUnset(): Promise<void>;
  abstract destroy(): void;
}

export default BaseStateMachine;
