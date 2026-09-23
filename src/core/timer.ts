import { GAME_CONFIG } from './config.ts';

export type TimerWarningState = 'normal' | 'warning' | 'danger' | 'critical';

export interface TimerTickData {
  remainingSeconds: number;
  totalDurationSeconds: number;
  percentage: number;
  state: TimerWarningState;
}

export class GameTimer {
  private initialDuration: number;
  private durationMs: number;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private timerRequestId: number | null = null;

  private onTickCallback?: (data: TimerTickData) => void;
  private onTimeoutCallback?: () => void;

  constructor(durationSeconds: number = GAME_CONFIG.baseRoundSeconds) {
    this.initialDuration = durationSeconds;
    this.durationMs = durationSeconds * 1000;
  }

  public setCallbacks(
    onTick?: (data: TimerTickData) => void,
    onTimeout?: () => void
  ): void {
    this.onTickCallback = onTick;
    this.onTimeoutCallback = onTimeout;
  }

  public start(): void {
    this.durationMs = this.initialDuration * 1000;
    this.startTime = performance.now();
    this.isRunning = true;
    this.isPaused = false;
    this.loop();
  }

  public pause(): void {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.pausedAt = performance.now();
    if (this.timerRequestId) {
      cancelAnimationFrame(this.timerRequestId);
      this.timerRequestId = null;
    }
  }

  public resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    const pauseDuration = performance.now() - this.pausedAt;
    this.startTime += pauseDuration;
    this.isPaused = false;
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timerRequestId) {
      cancelAnimationFrame(this.timerRequestId);
      this.timerRequestId = null;
    }
  }

  public revive(additionalSeconds: number = 15): void {
    this.initialDuration = Math.max(this.initialDuration, additionalSeconds);
    this.durationMs = additionalSeconds * 1000;
    this.startTime = performance.now();
    this.isRunning = true;
    this.isPaused = false;
    this.loop();
  }

  public addBonusSeconds(seconds: number): void {
    if (!this.isRunning) return;
    const currentRemaining = this.getRemainingSeconds();
    const maxCap = GAME_CONFIG.maxTimerCapSeconds;
    const newRemaining = Math.min(maxCap, currentRemaining + seconds);
    const addedMs = (newRemaining - currentRemaining) * 1000;
    this.durationMs += addedMs;
    this.emitTick();
  }

  public deductSeconds(seconds: number): void {
    if (!this.isRunning) return;
    const currentRemaining = this.getRemainingSeconds();
    const newRemaining = Math.max(0, currentRemaining - seconds);
    const subtractedMs = (currentRemaining - newRemaining) * 1000;
    this.durationMs -= subtractedMs;
    this.emitTick();

    if (newRemaining <= 0) {
      this.stop();
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
    }
  }

  public forceTick(): void {
    this.emitTick();
  }

  public getRemainingSeconds(): number {
    if (!this.isRunning) return 0;
    const now = this.isPaused ? this.pausedAt : performance.now();
    const elapsed = now - this.startTime;
    const remainingMs = Math.max(0, this.durationMs - elapsed);
    return Math.max(0, Math.round(remainingMs / 100) / 10);
  }

  private loop = (): void => {
    if (!this.isRunning || this.isPaused) return;

    const remaining = this.getRemainingSeconds();
    this.emitTick();

    if (remaining <= 0) {
      this.stop();
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
      return;
    }

    this.timerRequestId = requestAnimationFrame(this.loop);
  };

  private emitTick(): void {
    if (!this.onTickCallback) return;

    const remaining = this.getRemainingSeconds();
    const totalSec = this.initialDuration;
    const percentage = Math.min(100, Math.max(0, (remaining / totalSec) * 100));

    let state: TimerWarningState = 'normal';
    if (remaining <= 5 || percentage <= 15) state = 'critical';
    else if (remaining <= 10 || percentage <= 30) state = 'danger';
    else if (remaining <= 18 || percentage <= 50) state = 'warning';

    this.onTickCallback({
      remainingSeconds: Math.ceil(remaining),
      totalDurationSeconds: Math.ceil(totalSec),
      percentage,
      state
    });
  }
}
