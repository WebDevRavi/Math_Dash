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
      <div class="modal-overlay" style="align-items: center; justify-content: center;">
        <div style="background: rgba(14, 26, 18, 0.95); border: 3px dashed rgba(248,250,252,0.8); border-radius: 16px; padding: 28px 36px; max-width: 440px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          <h2 class="modal-title chalk-heading chalk-yellow" style="font-size: 38px;">Game Paused</h2>
          <p style="font-family: var(--font-chalk-subheading); font-size: 18px; color: var(--chalk-white); text-align: center;">
            Take a breather! Your timer and score are safe.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 10px;">
            <button id="btn-pause-resume" class="chalk-btn" style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid var(--chalk-green); background: rgba(74, 222, 128, 0.15); font-family: var(--font-chalk-heading); font-size: 22px; color: var(--chalk-green);">
              ▶ Resume Game
            </button>
            <button id="btn-pause-exit" class="chalk-btn" style="width: 100%; padding: 12px; border-radius: 10px; border: 2px dashed var(--chalk-red); background: rgba(248, 113, 113, 0.15); font-family: var(--font-chalk-subheading); font-size: 18px; color: var(--chalk-red);">
              ✕ Exit to Main Menu
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-pause-resume')?.addEventListener('click', () => this.onResume());
    document.getElementById('btn-pause-exit')?.addEventListener('click', () => this.onExit());
  }
}
