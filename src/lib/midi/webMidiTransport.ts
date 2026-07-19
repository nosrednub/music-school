import { inputBus } from "./inputBus";
import type { MidiNoteEvent, MidiTransport, Unsubscribe } from "./types";
import { createMidiNoteEvent, isWebMidiSupported } from "./types";

export class WebMidiTransport implements MidiTransport {
  readonly kind = "web-midi" as const;
  readonly label = "USB / Bluetooth MIDI";
  private access: MIDIAccess | null = null;
  private connected = false;
  private noteHandlers = new Set<(event: MidiNoteEvent) => void>();
  private connectionHandlers = new Set<(connected: boolean) => void>();
  private inputUnsubs: Unsubscribe[] = [];

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (!isWebMidiSupported()) {
      throw new Error("Web MIDI is not supported in this browser");
    }

    this.access = await navigator.requestMIDIAccess();
    this.bindInputs();
    this.connected = this.access.inputs.size > 0;
    this.notifyConnection();

    this.access.onstatechange = () => {
      this.clearInputBindings();
      this.bindInputs();
      this.connected = (this.access?.inputs.size ?? 0) > 0;
      this.notifyConnection();
    };
  }

  disconnect(): void {
    this.clearInputBindings();
    this.access = null;
    this.connected = false;
    this.notifyConnection();
  }

  onNote(handler: (event: MidiNoteEvent) => void): Unsubscribe {
    this.noteHandlers.add(handler);
    return () => this.noteHandlers.delete(handler);
  }

  onConnectionChange(handler: (connected: boolean) => void): Unsubscribe {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  private bindInputs(): void {
    if (!this.access) {
      return;
    }

    for (const input of this.access.inputs.values()) {
      const handler = (message: MIDIMessageEvent) => {
        this.handleMessage(message);
      };
      input.addEventListener("midimessage", handler);
      this.inputUnsubs.push(() =>
        input.removeEventListener("midimessage", handler),
      );
    }
  }

  private clearInputBindings(): void {
    for (const unsub of this.inputUnsubs) {
      unsub();
    }
    this.inputUnsubs = [];
  }

  private handleMessage(message: MIDIMessageEvent): void {
    const data = message.data;
    if (!data || data.length < 3) {
      return;
    }

    const status = data[0];
    const command = status & 0xf0;
    const note = data[1];
    const velocity = data[2];

    let type: "noteon" | "noteoff" | null = null;
    if (command === 0x90 && velocity > 0) {
      type = "noteon";
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      type = "noteoff";
    }

    if (!type) {
      return;
    }

    const timestamp =
      typeof message.timeStamp === "number" && message.timeStamp > 0
        ? message.timeStamp
        : performance.now();

    const event = createMidiNoteEvent({
      note,
      velocity,
      channel: status & 0x0f,
      type,
      timestamp,
      source: "web-midi",
    });

    for (const handler of this.noteHandlers) {
      handler(event);
    }
    inputBus.emit(event);
  }

  private notifyConnection(): void {
    for (const handler of this.connectionHandlers) {
      handler(this.connected);
    }
  }
}

export const getMidiInputDeviceNames = (access: MIDIAccess): string[] => {
  return [...access.inputs.values()].map((input) => input.name ?? "MIDI Input");
};
