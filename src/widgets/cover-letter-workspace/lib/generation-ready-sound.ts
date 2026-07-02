type AudioContextConstructor = new () => AudioContext;

type WindowWithLegacyAudioContext = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

export type GenerationReadySound = {
  unlock: () => void;
  play: () => void;
};

export function createGenerationReadySound(): GenerationReadySound {
  let audioContext: AudioContext | null = null;

  function getAudioContext() {
    if (typeof window === "undefined") {
      return null;
    }

    if (audioContext && audioContext.state !== "closed") {
      return audioContext;
    }

    const AudioContext =
      window.AudioContext ??
      (window as WindowWithLegacyAudioContext).webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    audioContext = new AudioContext();

    return audioContext;
  }

  function resumeAudioContext() {
    const context = getAudioContext();

    if (!context || context.state !== "suspended") {
      return;
    }

    void context.resume().catch(() => undefined);
  }

  return {
    unlock: resumeAudioContext,
    play: () => {
      const context = getAudioContext();

      if (!context) {
        return;
      }

      resumeAudioContext();

      const startTime = context.currentTime + 0.02;

      playTone(context, {
        frequency: 880,
        startTime,
        duration: 0.12,
        volume: 0.035,
      });
      playTone(context, {
        frequency: 1174.66,
        startTime: startTime + 0.1,
        duration: 0.16,
        volume: 0.032,
      });
    },
  };
}

function playTone(
  context: AudioContext,
  {
    frequency,
    startTime,
    duration,
    volume,
  }: {
    frequency: number;
    startTime: number;
    duration: number;
    volume: number;
  },
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endTime = startTime + duration;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.02);
  oscillator.addEventListener(
    "ended",
    () => {
      oscillator.disconnect();
      gain.disconnect();
    },
    { once: true },
  );
}
