export class CountdownScreen {
  private container: HTMLElement;
  private onComplete: () => void;
  private onTickSound: () => void;
  private onGoSound: () => void;
  private timerId: number | null = null;

  constructor(
    container: HTMLElement,
    onComplete: () => void,
    onTickSound: () => void,
    onGoSound: () => void
  ) {
    this.container = container;
    this.onComplete = onComplete;
    this.onTickSound = onTickSound;
    this.onGoSound = onGoSound;
  }

  public start(): void {
    const steps = [
      { text: '3', isGo: false, duration: 850 },
      { text: '2', isGo: false, duration: 850 },
      { text: '1', isGo: false, duration: 850 },
      { text: 'BREACH!', isGo: true, duration: 650 }
    ];

    let currentStep = 0;

    const runStep = () => {
      if (currentStep >= steps.length) {
        this.onComplete();
        return;
      }

      const step = steps[currentStep];
      this.renderStep(step.text, step.isGo);

      if (step.isGo) {
        this.onGoSound();
      } else {
        this.onTickSound();
      }

      currentStep++;
      this.timerId = window.setTimeout(runStep, step.duration);
    };

    runStep();
  }

  public cancel(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private renderStep(text: string, isGo: boolean): void {
    this.container.innerHTML = `
      <div class="screen-countdown">
        <div class="countdown-number cyber-countdown-number ${isGo ? 'go cyber-go' : ''}">
          ${text}
        </div>
      </div>
    `;
  }
}
