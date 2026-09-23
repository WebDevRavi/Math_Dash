import { ScoreSummary } from '../core/scoring.ts';

export interface GameOverScreenCallbacks {
  onHome: () => void;
  onRestart: () => void;
  onShare?: () => void;
}

export class GameOverScreen {
  private container: HTMLElement;
  private callbacks: GameOverScreenCallbacks;

  constructor(
    container: HTMLElement,
    callbacks: GameOverScreenCallbacks,
    data: {
      summary: ScoreSummary;
      level: number;
      isNewBest: boolean;
    }
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.render(data);
  }

  private render(data: {
    summary: ScoreSummary;
    level: number;
    isNewBest: boolean;
  }): void {
    const dataBlocksHtml = this.generateDataBlocksHtml(data.summary.correctCount);

    this.container.innerHTML = `
      <div class="screen-game-over anim-fade">
        <!-- Title & Score Header -->
        <div class="game-over-summary-header cyber-game-over-header">
          <div class="lockdown-badge cyber-mono">SYSTEM TRACE COMPLETE // LOCKDOWN</div>
          <h1 class="game-over-title cyber-title">ACCESS REVOKED</h1>
          
          <div class="game-over-score-row cyber-score-row">
            <span class="neon-white">EXTRACTED:</span>
            <span class="neon-cyan">${data.summary.score}</span>
            ${data.isNewBest ? '<span class="new-record-chip anim-pop">NEW RECORD</span>' : ''}
          </div>

          <div class="game-over-star-divider">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>

          <div class="game-over-level-row cyber-sector-row">
            <span class="neon-dim">INFILTRATED SECTOR:</span>
            <span class="neon-yellow">${data.level < 10 ? '0' : ''}${data.level}</span>
          </div>
        </div>

        <!-- Decrypted Data Memory Packets Grid -->
        <div class="data-packets-container cyber-mono">
          ${dataBlocksHtml}
        </div>

        <!-- Scorecard Box -->
        <div class="game-over-scorecard cyber-scorecard">
          <!-- Col 1: Security Rating -->
          <div class="scorecard-col">
            <svg class="scorecard-icon neon-yellow" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span class="scorecard-val neon-yellow">${data.summary.starsEarned}</span>
            <span class="scorecard-label cyber-mono">Rating</span>
          </div>

          <!-- Col 2: Nodes Decrypted -->
          <div class="scorecard-col">
            <svg class="scorecard-icon neon-green" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="scorecard-val neon-green">${data.summary.correctCount}</span>
            <span class="scorecard-label cyber-mono">Nodes Cracked</span>
          </div>

          <!-- Col 3: Firewalls Blocked -->
          <div class="scorecard-col">
            <svg class="scorecard-icon neon-magenta" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="scorecard-val neon-magenta">${data.summary.wrongCount}</span>
            <span class="scorecard-label cyber-mono">Trace Alerts</span>
          </div>

          <!-- Col 4: Time Buffer -->
          <div class="scorecard-col">
            <svg class="scorecard-icon neon-cyan" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="13" r="8"></circle>
              <path d="M12 9v4l2 2"></path>
              <path d="M5 3L2 6"></path>
              <path d="M22 6l-3-3"></path>
            </svg>
            <span class="scorecard-val neon-cyan">0s</span>
            <span class="scorecard-label cyber-mono">Buffer Left</span>
          </div>
        </div>

        <!-- Action Buttons: Home, Share & Restart -->
        <div class="game-over-actions cyber-game-over-actions">
          <div class="game-over-btn-item">
            <button class="game-over-btn cyber-icon-btn" id="btn-gameover-home" title="Main Terminal" aria-label="Main Terminal">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
            <span class="sub-action-label cyber-mono neon-dim">TERMINAL</span>
          </div>

          <div class="game-over-btn-item">
            <button class="game-over-btn cyber-icon-btn" id="btn-gameover-share" title="Transmit Telemetry" aria-label="Transmit Telemetry">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <span class="sub-action-label cyber-mono neon-dim">TRANSMIT</span>
          </div>

          <div class="game-over-btn-item">
            <button class="game-over-btn cyber-icon-btn action-restart-btn" id="btn-gameover-restart" title="Re-Infiltrate" aria-label="Re-Infiltrate">
              <svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
            </button>
            <span class="sub-action-label cyber-mono neon-cyan">RE-BREACH</span>
          </div>
        </div>

        <!-- Creator Credits -->
        <div class="game-over-creator-credit cyber-mono neon-dim" style="margin-top: 10px; font-size: 11px; letter-spacing: 1px; text-align: center; opacity: 0.7;">
          CYBER HACK: OVERDRIVE // CREATED BY RAVI SOLANKI
        </div>
      </div>
    `;

    document.getElementById('btn-gameover-home')?.addEventListener('click', () => {
      this.callbacks.onHome();
    });

    document.getElementById('btn-gameover-share')?.addEventListener('click', () => {
      this.callbacks.onShare?.();
    });

    document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
      this.callbacks.onRestart();
    });
  }

  /**
   * Replaces chalk tally marks with High-Tech Decrypted Data Packets Matrix
   */
  private generateDataBlocksHtml(count: number): string {
    if (count === 0) {
      return `<div class="no-packets-msg neon-dim">[ ZERO DECRYPTED PACKETS RECORDED ]</div>`;
    }

    const fullSectors = Math.min(6, Math.floor(count / 5));
    const remainder = count % 5;

    let html = `<div class="packets-matrix-label">DECRYPTED DATA CLUSTERS [${count} NODES VERIFIED]:</div><div class="packets-grid">`;

    for (let s = 0; s < fullSectors; s++) {
      html += `
        <div class="packet-cluster full-cluster" title="5 Decrypted Nodes">
          <span class="packet-bit verified">1</span>
          <span class="packet-bit verified">1</span>
          <span class="packet-bit verified">1</span>
          <span class="packet-bit verified">1</span>
          <span class="packet-cluster-tag">✓5</span>
        </div>
      `;
    }

    if (remainder > 0 && fullSectors < 6) {
      html += `<div class="packet-cluster partial-cluster">`;
      for (let r = 0; r < remainder; r++) {
        html += `<span class="packet-bit verified">1</span>`;
      }
      for (let empty = remainder; empty < 4; empty++) {
        html += `<span class="packet-bit unverified">0</span>`;
      }
      html += `<span class="packet-cluster-tag">+${remainder}</span></div>`;
    }

    if (count > 30) {
      const extra = count - 30;
      html += `<div class="packet-extra-badge neon-yellow">+${extra} MORE</div>`;
    }

    html += `</div>`;
    return html;
  }
}
