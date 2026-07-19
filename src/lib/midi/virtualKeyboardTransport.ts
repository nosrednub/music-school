import { inputBus } from "./inputBus";
import type { MidiTransport, Unsubscribe } from "./types";

/** Always available — on-screen piano emits through inputBus */
export class VirtualKeyboardTransport implements MidiTransport {
  readonly kind = "virtual" as const;
  readonly label = "On-screen piano";
  private connected = true;
  private noteHandlers = new Set<(event: import("./types").MidiNoteEvent) => void>();
  private busUnsub: Unsubscribe | null = null;

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    this.connected = true;
    if (!this.busUnsub) {
      this.busUnsub = inputBus.subscribe((event) => {
        if (event.source === "virtual") {
          for (const handler of this.noteHandlers) {
            handler(event);
          }
        }
      });
    }
  }

  disconnect(): void {
    this.connected = false;
    this.busUnsub?.();
    this.busUnsub = null;
  }

  onNote(handler: (event: import("./types").MidiNoteEvent) => void): Unsubscribe {
    this.noteHandlers.add(handler);
    return () => this.noteHandlers.delete(handler);
  }

  onConnectionChange(): Unsubscribe {
    return () => undefined;
  }
}
