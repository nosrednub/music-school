import { inputBus } from "./inputBus";
import type { MidiNoteEvent, MidiTransport, Unsubscribe } from "./types";
import { createMidiNoteEvent } from "./types";

export const MIDI_LINK_URL = "ws://127.0.0.1:47809";

type LinkMessage = {
  type: "noteon" | "noteoff";
  note: number;
  velocity: number;
  channel?: number;
  timestamp?: number;
};

export const isLikelySafariWithoutWebMidi = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
  return isSafari;
};

export class LinkTransport implements MidiTransport {
  readonly kind = "link-bridge" as const;
  readonly label = "Music School MIDI Link";
  private ws: WebSocket | null = null;
  private connected = false;
  private noteHandlers = new Set<(event: MidiNoteEvent) => void>();
  private connectionHandlers = new Set<(connected: boolean) => void>();

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (typeof WebSocket === "undefined") {
      throw new Error("WebSocket not available");
    }

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(MIDI_LINK_URL);
      const timeout = window.setTimeout(() => {
        ws.close();
        reject(
          new Error(
            "MIDI Link not found — install the menubar app and plug in your keyboard.",
          ),
        );
      }, 4000);

      ws.onopen = () => {
        window.clearTimeout(timeout);
        this.ws = ws;
        this.connected = true;
        this.notifyConnection();
        resolve();
      };

      ws.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Could not connect to MIDI Link on localhost:47809"));
      };

      ws.onclose = () => {
        this.connected = false;
        this.ws = null;
        this.notifyConnection();
      };

      ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
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

  private handleMessage(raw: unknown): void {
    try {
      const data = JSON.parse(String(raw)) as LinkMessage;
      if (data.type !== "noteon" && data.type !== "noteoff") {
        return;
      }

      const event = createMidiNoteEvent({
        note: data.note,
        velocity: data.velocity,
        channel: data.channel ?? 0,
        type: data.type,
        source: "link-bridge",
        timestamp: data.timestamp ?? performance.now(),
      });

      for (const handler of this.noteHandlers) {
        handler(event);
      }
      inputBus.emit(event);
    } catch {
      /* ignore malformed frames */
    }
  }

  private notifyConnection(): void {
    for (const handler of this.connectionHandlers) {
      handler(this.connected);
    }
  }
}
