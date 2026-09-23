import { LifetimeStats } from '../core/statistics.ts';

export class StatisticsModal {
  private container: HTMLElement;
  private onClose: () => void;
  private onReset: () => void;
  private isConfirmingReset: boolean = false;
  private resetTimeoutId: number | null = null;

  constructor(
    container: HTMLElement,
    stats: LifetimeStats,
    accuracy: number,
    onClose: () => void,
    onReset: () => void
  ) {
    this.container = container;
    this.onClose = onClose;
    this.onReset = onReset;
    this.render(stats, accuracy);
  }

  private render(stats: LifetimeStats, accuracy: number): void {
    this.container.innerHTML = `
      <div class="modal-overlay cyber-modal-overlay">
        <div class="modal-header cyber-modal-header">
          <h2 class="modal-title cyber-heading neon-cyan">NETRUNNER TELEMETRY</h2>
          <button class="modal-close-btn cyber-close-btn" id="btn-close-stats" aria-label="Close Telemetry">✕</button>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 10px 0;">
          <div class="stats-grid cyber-stats-grid">
            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Top Data Record:</span>
              <span class="stat-value neon-cyan">${stats.bestScore}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Highest Sector:</span>
              <span class="stat-value neon-yellow">SECTOR ${stats.bestLevel < 10 ? '0' : ''}${stats.bestLevel}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Longest Neural Streak:</span>
              <span class="stat-value neon-green">x${stats.bestStreak}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Decryption Accuracy:</span>
              <span class="stat-value neon-green">${accuracy}%</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Missions Launched:</span>
              <span class="stat-value neon-white">${stats.gamesPlayed}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Total Nodes Scanned:</span>
              <span class="stat-value neon-white">${stats.questionsAnswered}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Successful Decryptions:</span>
              <span class="stat-value neon-green">${stats.correctAnswers}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Firewall Blocks:</span>
              <span class="stat-value neon-magenta">${stats.wrongAnswers}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Security Stars:</span>
              <span class="stat-value neon-yellow">⭐ ${stats.starsEarned}</span>
            </div>

            <div class="stat-row cyber-stat-row">
              <span class="stat-title cyber-mono">Overclock Surges:</span>
              <span class="stat-value neon-cyan">⚡ ${stats.timeBonusesUsed}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(0,240,255,0.25); padding-top: 10px; flex-wrap: wrap; gap: 8px;">
          <button id="btn-reset-stats" class="cyber-mono" style="font-size: 13px; color: var(--cyber-magenta); text-decoration: underline; opacity: 0.9; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s ease;">
            Purge Telemetry Logs
          </button>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="cyber-mono" style="font-size: 12px; color: var(--cyber-dim);">CYBER HACK: OVERDRIVE // CREATED BY RAVI SOLANKI</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-stats')?.addEventListener('click', () => this.onClose());

    const resetBtn = document.getElementById('btn-reset-stats');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!this.isConfirmingReset) {
          this.isConfirmingReset = true;
          resetBtn.textContent = '⚠️ Confirm Purge (Click Again)';
          resetBtn.style.color = 'var(--cyber-yellow)';
          resetBtn.style.fontWeight = 'bold';

          this.resetTimeoutId = window.setTimeout(() => {
            this.isConfirmingReset = false;
            resetBtn.textContent = 'Purge Telemetry Logs';
            resetBtn.style.color = 'var(--cyber-magenta)';
            resetBtn.style.fontWeight = 'normal';
          }, 3000);
        } else {
          if (this.resetTimeoutId !== null) {
            clearTimeout(this.resetTimeoutId);
            this.resetTimeoutId = null;
          }
          this.isConfirmingReset = false;
          this.onReset();
        }
      });
    }
  }
}
