export class AudioService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private isUnlocked: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;

  constructor(initialEnabled: boolean = true) {
    this.enabled = initialEnabled;
    this.initAudioContext();
  }

  private initAudioContext(): void {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  public unlock(): void {
    if (this.isUnlocked && this.ctx && this.ctx.state !== 'suspended') return;
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
        if (this.isMusicPlaying && this.enabled) {
          this.scheduleMusicNotes();
        }
      }).catch(err => console.warn('Audio resume error:', err));
    } else {
      this.isUnlocked = true;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopHomeMusic();
    }
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.enabled) {
      this.stopHomeMusic();
    }
  }

  public startHomeMusic(): void {
    if (!this.enabled || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.unlock();
    this.scheduleMusicNotes();
  }

  public stopHomeMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  private scheduleMusicNotes(): void {
    if (!this.ctx || this.musicIntervalId !== null) return;

    // Ambient relaxing pentatonic chords: C4, E4, G4, A4, B4, C5
    const scale = [261.63, 329.63, 392.00, 440.00, 493.88, 523.25];
    let step = 0;

    const playNote = () => {
      if (!this.isMusicPlaying || !this.enabled || !this.ctx || this.ctx.state === 'suspended') return;
      const now = this.ctx.currentTime;

      const freq = scale[step % scale.length];
      step = (step + (Math.random() > 0.4 ? 1 : 2)) % scale.length;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Low volume background chill music
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.028, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    };

    // Play a gentle ambient note every 950ms
    playNote();
    this.musicIntervalId = window.setInterval(playNote, 950);
  }

  public playButtonClick(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playCorrect(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    // Harmonic bell chord: E5 -> G#5 -> B5
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);

      gain.gain.setValueAtTime(0.22, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.22);
    });
  }

  public playWrong(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCountdownTick(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playGo(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Fanfare
    notes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  public playTimeBonusCharge(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playTimeBonusUse(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    // Dual pitch sweep
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(500, now);
    osc1.frequency.exponentialRampToValueAtTime(1500, now + 0.28);

    osc2.frequency.setValueAtTime(750, now);
    osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.28);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }

  public playLevelUp(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  public playGameOver(): void {
    if (!this.enabled || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const notes = [587.33, 523.25, 440.00, 392.00]; // D5 -> C5 -> A4 -> G4
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.22, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });
  }
}
