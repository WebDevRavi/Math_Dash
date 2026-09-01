export class GameShell {
  private rootElement: HTMLElement;
  private screenContainer!: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.render();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <div class="game-viewport">
        <div class="chalkboard-frame" id="chalkboard-frame">
          <!-- 4 Corner Metal Bolts -->
          <div class="frame-bolt bolt-tl"></div>
          <div class="frame-bolt bolt-tr"></div>
          <div class="frame-bolt bolt-bl"></div>
          <div class="frame-bolt bolt-br"></div>

          <!-- Chalkboard Inner Surface -->
          <div class="chalkboard-surface" id="chalkboard-surface">
            <!-- Chalk Dust Noise Overlay -->
            <div class="chalk-dust-overlay"></div>

            <!-- Hand-drawn Chalk Doodles Background SVG Layer -->
            <svg class="chalk-doodles-bg" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Top Left: 2 + 3 = 5 -->
              <text x="70" y="110" font-family="'Patrick Hand', cursive" font-size="28" fill="#f8fafc" opacity="0.6" transform="rotate(-6 70 110)">2+3=5</text>
              
              <!-- Left Bulb Doodle -->
              <g transform="translate(60, 160) scale(0.65)" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round" opacity="0.5">
                <path d="M40 20 C25 20 15 32 15 48 C15 62 25 72 28 85 L52 85 C55 72 65 62 65 48 C65 32 55 20 40 20 Z" />
                <path d="M30 85 L50 85 M32 92 L48 92 M35 99 L45 99" />
                <path d="M40 5 L40 12 M15 15 L22 20 M65 15 L58 20 M5 45 L12 45 M75 45 L68 45" />
              </g>

              <!-- Left Equation: 9 - 4 = 5 -->
              <text x="65" y="340" font-family="'Patrick Hand', cursive" font-size="26" fill="#f8fafc" opacity="0.5" transform="rotate(4 65 340)">9-4=5</text>

              <!-- Left Tic-Tac-Toe Grid -->
              <g transform="translate(70, 420) scale(0.55)" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round" opacity="0.45">
                <line x1="10" y1="35" x2="80" y2="35" />
                <line x1="10" y1="65" x2="80" y2="65" />
                <line x1="35" y1="10" x2="35" y2="90" />
                <line x1="60" y1="10" x2="60" y2="90" />
                <path d="M16 16 L28 28 M28 16 L16 28" />
                <path d="M41 41 L53 53 M53 41 L41 53" />
                <circle cx="70" cy="50" r="8" fill="none" />
                <circle cx="22" cy="78" r="8" fill="none" />
                <path d="M64 68 L76 80 M76 68 L64 80" />
              </g>

              <!-- Top Right: 7 × 6 = 42 -->
              <text x="1000" y="115" font-family="'Patrick Hand', cursive" font-size="28" fill="#f8fafc" opacity="0.6" transform="rotate(5 1000 115)">7×6=42</text>

              <!-- Right Star Doodle -->
              <path d="M1070 220 L1076 235 L1092 236 L1079 246 L1084 261 L1070 251 L1056 261 L1061 246 L1048 236 L1064 235 Z" stroke="#f8fafc" stroke-width="2" opacity="0.4" fill="none" />

              <!-- Right Equation: 15 ÷ 3 = 5 -->
              <text x="980" y="340" font-family="'Patrick Hand', cursive" font-size="26" fill="#f8fafc" opacity="0.5" transform="rotate(-3 980 340)">15÷3=5</text>

              <!-- Paper Airplane and trail matching Reference @image3 -->
              <g transform="translate(820, 260) scale(0.6)" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55">
                <path d="M10 50 L90 10 L60 80 L45 55 Z" fill="none" />
                <path d="M45 55 L90 10" />
                <path d="M0 60 Q-40 80 -80 60 T-160 70" stroke-dasharray="6 6" fill="none" />
              </g>

              <!-- Right Triangle Doodle with a, b, c -->
              <g transform="translate(970, 410) scale(0.6)" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round" opacity="0.5">
                <polygon points="20,80 120,80 120,10" fill="none" />
                <rect x="106" y="66" width="14" height="14" fill="none" />
                <text x="65" y="100" font-family="'Patrick Hand', cursive" font-size="24" fill="#f8fafc" stroke="none">b</text>
                <text x="130" y="50" font-family="'Patrick Hand', cursive" font-size="24" fill="#f8fafc" stroke="none">a</text>
                <text x="60" y="40" font-family="'Patrick Hand', cursive" font-size="24" fill="#f8fafc" stroke="none">c</text>
              </g>
            </svg>

            <!-- Dynamic Screens Container -->
            <div class="screen-container" id="screen-container"></div>
          </div>
        </div>
      </div>
    `;

    this.screenContainer = document.getElementById('screen-container') as HTMLElement;
  }

  public getScreenContainer(): HTMLElement {
    return this.screenContainer;
  }
}
