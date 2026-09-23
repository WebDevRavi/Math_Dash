export class PauseModal {
  private container: HTMLElement;
  private onResume: () => void;
  private onExit: () => void;

  constructor(container: HTMLElement, onResume: () => void, onExit: () => void) {
    this.container = container;
    this.onResume = onResume;
    this.onExit = onExit;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="modal-overlay cyber-modal-overlay" style="align-items: center; justify-content: center;">
        <div class="cyber-modal-box" style="background: rgba(8, 14, 28, 0.96); border: 2px solid var(--cyber-cyan); border-radius: 14px; padding: 28px 36px; max-width: 440px; width: 90%; display: flex; flex-direction: column; align-items: center; gap: 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.9), 0 0 25px rgba(0,240,255,0.25);">
          <div class="cyber-mono neon-cyan" style="font-size: 11px; letter-spacing: 2px;">NEURAL LINK ON STANDBY</div>
          <h2 class="modal-title cyber-heading neon-yellow" style="font-size: 32px; letter-spacing: 2px;">PROTOCOL PAUSED</h2>
          <p class="cyber-mono" style="font-size: 14px; color: var(--cyber-dim); text-align: center;">
            Trace timer and node decryption telemetry safely suspended.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 8px;">
            <button id="btn-pause-resume" class="cyber-btn" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid var(--cyber-green); background: rgba(0, 255, 102, 0.12); font-family: var(--font-cyber-display); font-size: 18px; color: var(--cyber-green); box-shadow: 0 0 15px var(--cyber-green-glow);">
              ▶ RESUME BREACH
            </button>
            <button id="btn-pause-exit" class="cyber-btn" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid var(--cyber-magenta); background: rgba(255, 0, 85, 0.12); font-family: var(--font-cyber-ui); font-size: 16px; font-weight: 700; color: var(--cyber-magenta); letter-spacing: 1px;">
              ✕ ABORT TO TERMINAL
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-pause-resume')?.addEventListener('click', () => this.onResume());
    document.getElementById('btn-pause-exit')?.addEventListener('click', () => this.onExit());
  }
}
