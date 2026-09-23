/**
 * OrientationOverlay: Manages mobile landscape orientation and triggers
 * ScreenOrientation API locks for seamless full-screen landscape gameplay.
 */
export class OrientationOverlay {
  private overlayElement: HTMLElement | null = null;
  private isPortrait: boolean = false;

  constructor() {
    this.createOverlay();
    this.attachListeners();
    this.checkOrientation();
  }

  private createOverlay(): void {
    if (document.getElementById('orientation-overlay')) {
      this.overlayElement = document.getElementById('orientation-overlay');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'orientation-overlay';
    overlay.className = 'orientation-overlay hidden';
    overlay.setAttribute('aria-label', 'Rotate device to landscape orientation');

    overlay.innerHTML = `
      <div class="orientation-content">
        <div class="orientation-phone-icon">
          <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect class="phone-body" x="30" y="16" width="40" height="68" rx="8" stroke="#00f0ff" stroke-width="3" fill="rgba(6, 12, 26, 0.9)" />
            <circle cx="50" cy="74" r="3" fill="#00f0ff" opacity="0.8" />
            <path class="phone-arrow" d="M 76 34 C 84 46, 82 62, 70 70" stroke="#ffb700" stroke-width="3.5" stroke-linecap="round" fill="none" />
            <polygon points="78,28 72,36 84,36" fill="#ffb700" />
          </svg>
        </div>
        <div class="orientation-heading cyber-heading neon-cyan" style="font-size: 16px;">
          BEST EXPERIENCED IN LANDSCAPE
        </div>
        <div style="font-size: 13px; color: rgba(240, 246, 252, 0.7); text-align: center; max-width: 280px;">
          Rotate your device for optimal cyber deck terminal view.
        </div>
        <button id="btn-orientation-dismiss" class="orientation-action-btn cyber-btn" style="padding: 8px 20px; font-size: 13px; margin-top: 8px;">
          <span>✓ CONTINUE</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayElement = overlay;

    document.getElementById('btn-orientation-dismiss')?.addEventListener('click', () => {
      this.overlayElement?.classList.add('hidden');
      this.requestLandscapeLock();
    });
  }

  private attachListeners(): void {
    window.addEventListener('resize', () => this.checkOrientation());
    window.addEventListener('orientationchange', () => this.checkOrientation());

    try {
      const portraitQuery = window.matchMedia('(orientation: portrait)');
      if (portraitQuery.addEventListener) {
        portraitQuery.addEventListener('change', () => this.checkOrientation());
      }
    } catch {
      // ignore
    }
  }

  public checkOrientation(): boolean {
    const isVertical = window.innerHeight > window.innerWidth;
    const isMobileSize = window.innerWidth <= 1024 || window.innerHeight <= 600;
    this.isPortrait = isVertical && isMobileSize;

    if (this.overlayElement) {
      if (this.isPortrait) {
        this.overlayElement.classList.remove('hidden');
      } else {
        this.overlayElement.classList.add('hidden');
      }
    }

    return !this.isPortrait;
  }

  public async requestLandscapeLock(): Promise<void> {
    try {
      // 1. Try modern ScreenOrientation API lock
      const orientation = screen.orientation as any;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape');
        this.checkOrientation();
        return;
      }
    } catch {
      // Screen orientation lock might fail without native fullscreen or on unsupported browsers
    }

    try {
      // 2. Fallback: Try requesting fullscreen to facilitate auto-rotation
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
      const orientation = screen.orientation as any;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape');
      }
    } catch {
      // Ignore
    }
  }

  public isCurrentlyPortrait(): boolean {
    return this.isPortrait;
  }
}
