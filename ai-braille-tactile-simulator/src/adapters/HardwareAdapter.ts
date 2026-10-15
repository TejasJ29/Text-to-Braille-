import { SixBitPattern } from '../types/braille';

export interface IHardwareAdapter {
  readonly mode: 'Simulation' | 'Hardware';
  readonly device: string;
  readonly firmwareStatus: string;
  readonly isConnected: boolean;
  actuateBits(bits: SixBitPattern): Promise<void>;
  resetAllPins(): Promise<void>;
}

/**
 * SimulationAdapter — Fully working local hardware simulator for 6 push-pull solenoids.
 */
export class SimulationAdapter implements IHardwareAdapter {
  public readonly mode = 'Simulation' as const;
  public readonly device = 'Not connected';
  public readonly firmwareStatus = 'Not available';
  public readonly isConnected = false;

  constructor(private readonly onStateUpdate: (bits: SixBitPattern) => void) {}

  async actuateBits(bits: SixBitPattern): Promise<void> {
    this.onStateUpdate([...bits] as SixBitPattern);
  }

  async resetAllPins(): Promise<void> {
    this.onStateUpdate([0, 0, 0, 0, 0, 0]);
  }
}

/**
 * HardwareAdapter — Clearly marked placeholder for future ESP32 Web Serial / WebSocket integration.
 * Does not fake a hardware connection.
 */
export class HardwareAdapter implements IHardwareAdapter {
  public readonly mode = 'Hardware' as const;
  public readonly device = 'Not connected';
  public readonly firmwareStatus = 'Not available';
  public readonly isConnected = false;

  async actuateBits(_bits: SixBitPattern): Promise<void> {
    throw new Error('ESP32 HardwareAdapter is a placeholder. Use SimulationAdapter for local demo.');
  }

  async resetAllPins(): Promise<void> {
    throw new Error('ESP32 HardwareAdapter is a placeholder. Use SimulationAdapter for local demo.');
  }
}
