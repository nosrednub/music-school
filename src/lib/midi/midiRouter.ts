import type { MidiTransport, MidiTransportKind } from "./types";
import { isWebMidiSupported } from "./types";
import { VirtualKeyboardTransport } from "./virtualKeyboardTransport";
import { WebMidiTransport } from "./webMidiTransport";

export type MidiRouterState = {
  active: MidiTransport;
  webMidi: WebMidiTransport | null;
  virtual: VirtualKeyboardTransport;
  webMidiAvailable: boolean;
};

let routerState: MidiRouterState | null = null;

export const getMidiRouter = (): MidiRouterState => {
  if (routerState) {
    return routerState;
  }

  const virtual = new VirtualKeyboardTransport();
  const webMidi = isWebMidiSupported() ? new WebMidiTransport() : null;

  routerState = {
    active: virtual,
    webMidi,
    virtual,
    webMidiAvailable: webMidi !== null,
  };

  void virtual.connect();

  return routerState;
};

export const connectWebMidi = async (): Promise<{
  success: boolean;
  deviceNames: string[];
  error?: string;
}> => {
  const router = getMidiRouter();
  if (!router.webMidi) {
    return {
      success: false,
      deviceNames: [],
      error: "Web MIDI not supported — use on-screen piano or install MIDI Link (Safari).",
    };
  }

  try {
    await router.webMidi.connect();
    router.active = router.webMidi;
    return { success: true, deviceNames: [] };
  } catch (err) {
    return {
      success: false,
      deviceNames: [],
      error: err instanceof Error ? err.message : "MIDI connection failed",
    };
  }
};

export const useVirtualOnly = (): void => {
  const router = getMidiRouter();
  router.webMidi?.disconnect();
  router.active = router.virtual;
};

export const getActiveTransportKind = (): MidiTransportKind => {
  return getMidiRouter().active.kind;
};
