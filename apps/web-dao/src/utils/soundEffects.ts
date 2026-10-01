/**
 * Web Audio API Notification Chime Synthesizer
 * 
 * Synthesizes ultra-clean, high-fidelity luxury sound cues
 * without relying on external MP3/WAV assets (zero 404s, zero lag).
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a warm, crisp two-tone notification chime (D5 -> A5 harmonic).
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    masterGain.connect(ctx.destination);

    // Oscillator 1: Primary crystal sine tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // smoothly glides to A5
    osc1.connect(masterGain);

    // Oscillator 2: Soft harmonic overtone (1174.66 Hz - D6)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Graceful silent fallback
    console.debug('[Audio] Notification chime fallback:', err);
  }
}

/**
 * Plays an alert chime for high-priority Matrix Root Leader offers.
 */
export function playPriorityAlertChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    masterGain.connect(ctx.destination);

    // Three-note luxury triad: F#5 (739.99) -> A5 (880) -> C#6 (1108.73)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(739.99, now);
    osc.frequency.setValueAtTime(880.0, now + 0.08);
    osc.frequency.setValueAtTime(1108.73, now + 0.16);
    osc.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.75);
  } catch (err) {
    console.debug('[Audio] Priority alert chime fallback:', err);
  }
}
