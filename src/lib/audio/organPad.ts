import { getSharedAudioContext } from "@/lib/audio/audioContext";

let padNodes: OscillatorNode[] = [];
let padGain: GainNode | null = null;

/** Simple gospel-style organ pad on root + fifth + octave */
export const startOrganPad = async (rootMidi: number): Promise<void> => {
  stopOrganPad();
  const ctx = getSharedAudioContext();
  await ctx.resume();

  const frequencies = [rootMidi, rootMidi + 7, rootMidi + 12].map(
    (midi) => 440 * 2 ** ((midi - 69) / 12),
  );

  padGain = ctx.createGain();
  padGain.gain.value = 0;
  padGain.connect(ctx.destination);

  padNodes = frequencies.map((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = 0.12;
    osc.connect(voiceGain);
    voiceGain.connect(padGain!);
    osc.start();
    return osc;
  });

  const now = ctx.currentTime;
  padGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
};

export const stopOrganPad = (): void => {
  if (!padGain) {
    padNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    });
    padNodes = [];
    return;
  }

  const ctx = getSharedAudioContext();
  const gain = padGain;
  const now = ctx.currentTime;
  gain.gain.linearRampToValueAtTime(0, now + 0.3);
  window.setTimeout(() => {
    padNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    });
    padNodes = [];
    padGain = null;
  }, 350);
};

export const disposeOrganPad = (): void => {
  stopOrganPad();
};
