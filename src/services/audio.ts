class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private sfxVolume: number = 0.7;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(_vol: number) {
    // Music disabled per user requirement
  }

  // Play crisp mechanical key press sound
  public playKeyPress() {
    if (!this.isEnabled || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High subtle click frequency
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Play musical hit chime based on judgment
  public playHit(type: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS', combo: number = 1) {
    if (!this.isEnabled || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'MISS') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.15);

      gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    } else {
      // Escalating pitch based on combo
      const baseFreq = type === 'PERFECT' ? 523.25 : type === 'GREAT' ? 440 : 349.23; // C5, A4, F4
      const pitchOffset = Math.min(combo * 15, 300);
      const freq = baseFreq + pitchOffset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.1);

      gain.gain.setValueAtTime(this.sfxVolume * (type === 'PERFECT' ? 0.5 : 0.35), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (type === 'MISS' ? 0.15 : 0.12));
  }

  // Play combo streak boost sound (Guitar Hero style multiplier sound)
  public playComboUp(multiplier: number) {
    if (!this.isEnabled || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [261.63, 329.63, 392.00, 523.25]; // C major chord arpeggio
    
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * (1 + multiplier * 0.1), startTime);

      gain.gain.setValueAtTime(this.sfxVolume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Background Synth Beat Loop Generator (Disabled per user requirement)
  public startMusic() {
    return;
  }

  public stopMusic() {
    return;
  }
}

export const soundEngine = new SoundEngine();
