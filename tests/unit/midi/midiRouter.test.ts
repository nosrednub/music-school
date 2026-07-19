import { describe, expect, it, vi } from "vitest";
import { inputBus } from "@/lib/midi/inputBus";
import { getMidiRouter, connectWebMidi } from "@/lib/midi/midiRouter";
import { isWebMidiSupported } from "@/lib/midi/types";

describe("inputBus", () => {
  it("fans out note events to subscribers", () => {
    const handler = vi.fn();
    const unsub = inputBus.subscribe(handler);

    inputBus.emitVirtualNote(60, "noteon");
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ note: 60, type: "noteon", source: "virtual" }),
    );

    unsub();
    inputBus.emitVirtualNote(62, "noteon");
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("midiRouter", () => {
  it("returns virtual transport by default", () => {
    const router = getMidiRouter();
    expect(router.active.kind).toBe("virtual");
    expect(router.virtual.isConnected).toBe(true);
  });

  it("reports web midi unavailable in test env", async () => {
    if (isWebMidiSupported()) {
      return;
    }
    const result = await connectWebMidi();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not supported/i);
  });
});
