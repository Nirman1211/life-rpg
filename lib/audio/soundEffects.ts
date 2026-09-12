/**
 * Web Audio API Synthesizer for LIFE RPG.
 * Synthesizes gaming sound effects directly via browser audio oscillators.
 * Zero external audio assets required; 100% offline-ready and lag-free.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("liferpg_sound");
      this.soundEnabled = stored !== "false";
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("liferpg_sound", String(enabled));
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Crisp celebratory chime when completing a quest
   */
  public playQuestComplete() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Triumphant fanfare when leveling up
   */
  public playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.12;

      noteOsc.type = "triangle";
      noteOsc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.2, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(startTime);
      noteOsc.stop(startTime + 0.4);
    });
  }

  /**
   * Golden coin ping when earning or spending gold
   */
  public playCoinDing() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Impact sound when striking boss
   */
  public playBossDamage() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Subtle click
   */
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sound = new SoundEffectsEngine();
