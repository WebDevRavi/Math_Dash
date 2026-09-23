export class AudioService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private isPlatformMuted: boolean = false;
  private isAdMuted: boolean = false;
  private isUnlocked: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;

  constructor(initialEnabled: boolean = true) {
    this.enabled = initialEnabled;
    this.initAudioContext();
    this.setupIOSTouchResume();
  }

  private initAudioContext(): void {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  /**
   * CrazyGames iOS requirement: Resumes suspended AudioContext on touchend user gesture.
   */
  private setupIOSTouchResume(): void {
    if (typeof document === 'undefined') return;
    document.addEventListener('touchend', () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      }
    }, { passive: true });
  }

  public unlock(): void {
    if (this.isUnlocked && this.ctx && this.ctx.state !== 'suspended') return;
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
        if (this.isMusicPlaying && this.isAudioActive()) {
          this.scheduleMusicNotes();
        }
      }).catch(err => console.warn('Audio resume error:', err));
    } else {
      this.isUnlocked = true;
    }
  }

  public isAudioActive(): boolean {
    return this.enabled && !this.isPlatformMuted && !this.isAdMuted;
  }

  public isEnabled(): boolean {
    return this.enabled && !this.isPlatformMuted;
  }

  public toggleSound(): boolean {
    if (this.isPlatformMuted) {
      return false;
    }
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

  public setPlatformMuted(muted: boolean): void {
    this.isPlatformMuted = muted;
    if (this.isPlatformMuted) {
      this.stopHomeMusic();
    }
  }

  public isPlatformMutedActive(): boolean {
    return this.isPlatformMuted;
  }

  public muteForAd(): void {
    this.isAdMuted = true;
    this.stopHomeMusic();
  }

  public unmuteForAd(): void {
    this.isAdMuted = false;
  }

  public suspend(): void {
    try {
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
      this.stopHomeMusic();
    } catch {
      // ignore
    }
  }

  public resume(): void {
    try {
      if (this.ctx && this.ctx.state === 'suspended' && this.isAudioActive()) {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  public startHomeMusic(): void {
    if (!this.isAudioActive() || this.isMusicPlaying) return;
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

  /**
   * Cyberpunk Synthwave Pulse Arpeggio:
   * Ambient electronic bassline & cyber arpeggiator
   */
  private scheduleMusicNotes(): void {
    if (!this.ctx || this.musicIntervalId !== null) return;

    // Cyberpunk synthwave bass frequencies (D Minor / Cyber scale: D2, F2, G2, A2, C3)
    const bassline = [73.42, 87.31, 98.00, 110.00, 130.81, 110.00];
    const leadNotes = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33];
    let step = 0;

    const playPulse = () => {
      if (!this.isMusicPlaying || !this.isAudioActive() || !this.ctx || this.ctx.state === 'suspended') return;
      const now = this.ctx.currentTime;

      // 1. Synth Bass Pulse
      const bassFreq = bassline[step % bassline.length];
      const oscBass = this.ctx.createOscillator();
      const gainBass = this.ctx.createGain();
      const filterBass = this.ctx.createBiquadFilter();

      filterBass.type = 'lowpass';
      filterBass.frequency.setValueAtTime(450, now);
      filterBass.frequency.exponentialRampToValueAtTime(150, now + 0.35);

      oscBass.type = 'sawtooth';
      oscBass.frequency.setValueAtTime(bassFreq, now);

      gainBass.gain.setValueAtTime(0.001, now);
      gainBass.gain.linearRampToValueAtTime(0.045, now + 0.04);
      gainBass.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      oscBass.connect(filterBass);
      filterBass.connect(gainBass);
      gainBass.connect(this.ctx.destination);

      oscBass.start(now);
      oscBass.stop(now + 0.48);

      // 2. High-Tech Shimmer Arpeggio on alternate beats
      if (step % 2 === 0) {
        const leadFreq = leadNotes[(step / 2) % leadNotes.length];
        const oscLead = this.ctx.createOscillator();
        const gainLead = this.ctx.createGain();
        const filterLead = this.ctx.createBiquadFilter();

        filterLead.type = 'bandpass';
        filterLead.frequency.setValueAtTime(1200, now);
        filterLead.Q.setValueAtTime(4, now);

        oscLead.type = 'triangle';
        oscLead.frequency.setValueAtTime(leadFreq, now);

        gainLead.gain.setValueAtTime(0.001, now);
        gainLead.gain.linearRampToValueAtTime(0.02, now + 0.02);
        gainLead.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

        oscLead.connect(filterLead);
        filterLead.connect(gainLead);
        gainLead.connect(this.ctx.destination);

        oscLead.start(now);
        oscLead.stop(now + 0.4);
      }

      step = (step + 1) % 16;
    };

    playPulse();
    this.musicIntervalId = window.setInterval(playPulse, 420); // Steady 142 BPM cyber pulse
  }

  public playButtonClick(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.035);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Cyber Decryption Success Ping
   */
  public playCorrect(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    // Harmonic cyber confirmation chime: C6 -> G6
    const freqs = [1046.50, 1567.98];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.025);

      gain.gain.setValueAtTime(0.2, now + idx * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.025 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.025);
      osc.stop(now + idx * 0.025 + 0.22);
    });
  }

  /**
   * Security Firewall Glitch Rejection (Wrong Answer)
   */
  public playWrong(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.16);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCountdownTick(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playGo(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Overclock Capacitor Charged
   */
  public playTimeBonusCharge(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.22);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Overclock Injected Surge (+Seconds)
   */
  public playTimeBonusUse(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    // Dual laser sweep
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(2200, now + 0.3);

    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(3000, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  /**
   * Sector Infiltrated / Level Up
   */
  public playLevelUp(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const chord = [587.33, 739.99, 880.00, 1174.66]; // D Major Synth
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.35);
    });
  }

  /**
   * System Trace Lockdown / Game Over
   */
  public playGameOver(): void {
    if (!this.isAudioActive() || !this.ctx) return;
    this.unlock();
    const now = this.ctx.currentTime;

    const notes = [659.25, 523.25, 440.00, 329.63, 220.00];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.3);
    });
  }
}
