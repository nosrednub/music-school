"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectWebMidi,
  getMidiRouter,
  inputBus,
  isWebMidiSupported,
} from "@/lib/midi";

type MidiConnectPanelProps = {
  onNoteOn?: (midi: number) => void;
};

export const MidiConnectPanel = ({ onNoteOn }: MidiConnectPanelProps) => {
  const [status, setStatus] = useState<"virtual" | "connected" | "unsupported">(
    isWebMidiSupported() ? "virtual" : "unsupported",
  );
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const router = getMidiRouter();
    void router.virtual.connect();

    const unsub = inputBus.subscribe((event) => {
      if (event.type === "noteon" && event.source === "web-midi") {
        onNoteOn?.(event.note);
      }
    });

    return unsub;
  }, [onNoteOn]);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    const result = await connectWebMidi();
    setConnecting(false);

    if (result.success) {
      setStatus("connected");
    } else {
      setError(result.error ?? "Could not connect MIDI");
      setStatus(isWebMidiSupported() ? "virtual" : "unsupported");
    }
  }, []);

  return (
    <div className="rounded-xl border border-gold/20 bg-navy-light/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70">MIDI input</p>
          <p className="mt-1 text-sm text-gold-light">
            {status === "connected" && "Keyboard connected via Web MIDI"}
            {status === "virtual" && "On-screen piano ready — or connect a keyboard"}
            {status === "unsupported" &&
              "Safari: use on-screen piano (MIDI Link coming soon)"}
          </p>
          {error && <p className="mt-1 text-xs text-coral">{error}</p>}
        </div>
        {isWebMidiSupported() && (
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={connecting || status === "connected"}
            className="min-h-11 shrink-0 rounded-full border border-gold/40 px-4 text-sm text-gold-light hover:border-gold disabled:opacity-50"
          >
            {connecting ? "…" : status === "connected" ? "✓ MIDI" : "Connect MIDI"}
          </button>
        )}
      </div>
    </div>
  );
};
