import type { MidiNoteEvent, Unsubscribe } from "./types";
import { createMidiNoteEvent } from "./types";

type NoteHandler = (event: MidiNoteEvent) => void;

/** Fan-out hub — all transports emit here; games subscribe once */
class InputBus {
  private handlers = new Set<NoteHandler>();

  emit(event: MidiNoteEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  subscribe(handler: NoteHandler): Unsubscribe {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emitVirtualNote(
    note: number,
    type: "noteon" | "noteoff",
    velocity = type === "noteon" ? 90 : 0,
    timestamp?: number,
  ): void {
    this.emit(
      createMidiNoteEvent({
        note,
        velocity,
        channel: 0,
        type,
        source: "virtual",
        timestamp,
      }),
    );
  }
}

export const inputBus = new InputBus();
