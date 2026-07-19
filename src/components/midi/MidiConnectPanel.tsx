"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectLinkMidi,
  connectWebMidi,
  getMidiRouter,
  inputBus,
  isLikelySafariWithoutWebMidi,
  isWebMidiSupported,
} from "@/lib/midi";

type MidiConnectPanelProps = {
  onNoteOn?: (midi: number) => void;
};

type MidiStatus = "virtual" | "web-midi" | "link-bridge" | "unsupported";

export const MidiConnectPanel = ({ onNoteOn }: MidiConnectPanelProps) => {
  const [status, setStatus] = useState<MidiStatus>(
    isWebMidiSupported() ? "virtual" : isLikelySafariWithoutWebMidi() ? "unsupported" : "virtual",
  );
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const showLink = isLikelySafariWithoutWebMidi() || !isWebMidiSupported();

  useEffect(() => {
    const router = getMidiRouter();
    void router.virtual.connect();

    const unsub = inputBus.subscribe((event) => {
      if (event.type === "noteon" && event.source !== "virtual") {
        onNoteOn?.(event.note);
      }
    });

    return unsub;
  }, [onNoteOn]);

  const handleConnectWeb = useCallback(async () => {
    setConnecting(true);
    setError(null);
    const result = await connectWebMidi();
    setConnecting(false);

    if (result.success) {
      setStatus("web-midi");
    } else {
      setError(result.error ?? "Could not connect MIDI");
      setStatus(isWebMidiSupported() ? "virtual" : "unsupported");
    }
  }, []);

  const handleConnectLink = useCallback(async () => {
    setConnecting(true);
    setError(null);
    const result = await connectLinkMidi();
    setConnecting(false);

    if (result.success) {
      setStatus("link-bridge");
    } else {
      setError(result.error ?? "Could not connect MIDI Link");
      setStatus("unsupported");
    }
  }, []);

  return (
    <div className="rounded-xl border border-gold/20 bg-navy-light/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70">MIDI input</p>
          <p className="mt-1 text-sm text-gold-light">
            {status === "web-midi" && "Keyboard connected via Web MIDI"}
            {status === "link-bridge" && "Keyboard connected via MIDI Link"}
            {status === "virtual" && "On-screen piano ready — or connect a keyboard"}
            {status === "unsupported" &&
              "Safari: use on-screen piano or connect MIDI Link (Mac)"}
          </p>
          {error && <p className="mt-1 text-xs text-coral">{error}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {isWebMidiSupported() && (
            <button
              type="button"
              onClick={() => void handleConnectWeb()}
              disabled={connecting || status === "web-midi"}
              className="min-h-11 rounded-full border border-gold/40 px-4 text-sm text-gold-light hover:border-gold disabled:opacity-50"
            >
              {connecting ? "…" : status === "web-midi" ? "✓ MIDI" : "Connect MIDI"}
            </button>
          )}
          {showLink && (
            <button
              type="button"
              onClick={() => void handleConnectLink()}
              disabled={connecting || status === "link-bridge"}
              className="min-h-11 rounded-full border border-gold/40 px-4 text-sm text-gold-light hover:border-gold disabled:opacity-50"
            >
              {status === "link-bridge" ? "✓ Link" : "MIDI Link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
