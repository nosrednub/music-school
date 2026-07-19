export type MidiTransportKind =
  | "web-midi"
  | "ble-midi"
  | "beacio-ble"
  | "link-bridge"
  | "virtual";

export type MidiNoteEvent = {
  note: number;
  velocity: number;
  channel: number;
  type: "noteon" | "noteoff";
  timestamp: number;
  source: MidiTransportKind;
};

export type Unsubscribe = () => void;

export type MidiTransport = {
  readonly kind: MidiTransportKind;
  readonly label: string;
  readonly isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): void;
  onNote(handler: (event: MidiNoteEvent) => void): Unsubscribe;
  onConnectionChange(handler: (connected: boolean) => void): Unsubscribe;
};

export const isWebMidiSupported = (): boolean => {
  return (
    typeof navigator !== "undefined" &&
    "requestMIDIAccess" in navigator
  );
};

export const createMidiNoteEvent = (
  partial: Omit<MidiNoteEvent, "timestamp" | "source"> & {
    timestamp?: number;
    source?: MidiTransportKind;
  },
): MidiNoteEvent => ({
  timestamp: partial.timestamp ?? performance.now(),
  source: partial.source ?? "virtual",
  note: partial.note,
  velocity: partial.velocity,
  channel: partial.channel,
  type: partial.type,
});
