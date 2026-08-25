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

  // Play realistic mechanical keyboard key press (Cherry MX Blue / Brown clack + switch bottom-out thock)
  public playKeyPress() {
    if (!this.isEnabled || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const vol = this.sfxVolume * 0.65;

    // 1. High frequency tactile "clack" click (Filtered white noise transient)
    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 0.007); // 7ms noise click
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.002));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2400 + Math.random() * 500, now); // 2.4kHz - 2.9kHz mechanical click
      bandpass.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.85, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.007);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.007);
    } catch {
      // Fallback if buffer creation fails
    }

    // 2. Low-mid mechanical switch bottom-out "thock" (Triangle pitch decay)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    const switchPitch = 220 + Math.random() * 40; // 220Hz - 260Hz switch body
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(switchPitch, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

    oscGain.gain.setValueAtTime(vol * 0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // Play judgment hit sound (Only error sound for MISS; letter typing uses mechanical keyboard sound above)
  public playHit(type: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS', _combo: number = 1) {
    if (!this.isEnabled || this.sfxVolume <= 0) return;

    // Remove musical chime ("bombita") sound on letter hits!
    if (type !== 'MISS') return;

    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Play combo streak boost sound (subtle click accent)
  public playComboUp(_multiplier: number) {
    // Disabled musical chord to keep clean mechanical typing experience
    return;
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
