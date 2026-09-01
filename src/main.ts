import './styles/reset.css';
import './styles/typography.css';
import './styles/chalkboard.css';
import './styles/animations.css';
import './styles/screens.css';

import { StateMachine, GameState } from './core/stateMachine.ts';
import { QuestionGenerator, Question } from './core/questionGenerator.ts';
import { GameTimer, TimerTickData } from './core/timer.ts';
import { ScoreManager } from './core/scoring.ts';
import { StreakManager } from './core/streak.ts';
import { LevelProgression, DifficultyMode } from './core/difficulty.ts';
import { AchievementManager } from './core/achievements.ts';
import { StatisticsManager } from './core/statistics.ts';
import { AudioService } from './audio/audioService.ts';
import { PlatformInterface } from './platform/platformInterface.ts';
import { CrazyGamesAdapter } from './platform/crazygamesAdapter.ts';
import { LocalDevAdapter } from './platform/localDevAdapter.ts';
import { SaveService } from './storage/saveService.ts';
import { GAME_CONFIG } from './core/config.ts';

import { GameShell } from './ui/gameShell.ts';
import { HomeScreen } from './ui/homeScreen.ts';
import { InstructionsScreen } from './ui/instructionsScreen.ts';
import { CountdownScreen } from './ui/countdownScreen.ts';
import { GameplayScreen } from './ui/gameplayScreen.ts';
import { GameOverScreen } from './ui/gameOverScreen.ts';
import { StatisticsModal } from './ui/statisticsModal.ts';
import { AchievementsModal } from './ui/achievementsModal.ts';
import { PauseModal } from './ui/pauseModal.ts';

class MathDashApp {
  private platform!: PlatformInterface;
  private saveService!: SaveService;
  private stateMachine!: StateMachine;
  private audioService!: AudioService;
  private questionGenerator!: QuestionGenerator;
  private timer!: GameTimer;
  private scoreManager!: ScoreManager;
  private streakManager!: StreakManager;
  private achievementManager!: AchievementManager;
  private statisticsManager!: StatisticsManager;

  private gameShell!: GameShell;
  private currentScreenContainer!: HTMLElement;
  private gameplayScreen: GameplayScreen | null = null;
  private countdownScreen: CountdownScreen | null = null;

  // Active game run state
  private activeDifficulty: DifficultyMode = 'NORMAL';
  private currentLevel: number = 1;
  private currentQuestion: Question | null = null;
  private bonusesUsedInRun: number = 0;
  private showInstructionsSetting: boolean = false;

  // First-time onboarding state
  private tutorialCompleted: boolean = false;
  private tutorialStreakShown: boolean = false;
  private tutorialBonusShown: boolean = false;

  public async init(): Promise<void> {
    // 1. Initialize Platform layer
    const isCrazyGamesEnv = typeof window !== 'undefined' && !!window.CrazyGames?.SDK;
    this.platform = isCrazyGamesEnv ? new CrazyGamesAdapter() : new LocalDevAdapter();
    await this.platform.init();
    this.platform.loadingStart();

    // 2. Load Save Data
    this.saveService = new SaveService(this.platform);
    const saved = await this.saveService.load();

    const initialSound = saved?.settings?.sound ?? true;
    this.showInstructionsSetting = saved?.settings?.showInstructions ?? false;
    this.tutorialCompleted = saved?.tutorialCompleted ?? false;

    // 3. Initialize Core Managers
    this.audioService = new AudioService(initialSound);
    this.stateMachine = new StateMachine('BOOT');
    this.questionGenerator = new QuestionGenerator();
    this.timer = new GameTimer(GAME_CONFIG.baseRoundSeconds);
    this.scoreManager = new ScoreManager();
    this.streakManager = new StreakManager();
    this.achievementManager = new AchievementManager(saved?.achievements);
    this.statisticsManager = new StatisticsManager(saved?.statistics);

    // 4. Mount Game Shell (Wooden frame & Chalkboard)
    const appRoot = document.getElementById('app')!;
    this.gameShell = new GameShell(appRoot);
    this.currentScreenContainer = this.gameShell.getScreenContainer();

    // 5. Global Event Listeners
    this.setupGlobalEvents();

    // 6. Complete loading
    this.platform.loadingStop();
    this.stateMachine.setState('HOME');
  }

  private setupGlobalEvents(): void {
    // State change handler
    this.stateMachine.onStateChange((newState) => {
      this.handleStateTransition(newState);
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Audio unlock & start home music on first user gesture
      this.audioService.unlock();
      if (this.stateMachine.getState() === 'HOME') {
        this.audioService.startHomeMusic();
      }

      const state = this.stateMachine.getState();
      if (state === 'PLAYING' && this.gameplayScreen) {
        if (e.key === 'Escape') {
          this.pauseGame();
          return;
        }
        const handled = this.gameplayScreen.handleKeyInput(e);
        if (handled) {
          e.preventDefault();
        }
      }
    });

    // Mouse/touch audio start for home music
    window.addEventListener('pointerdown', () => {
      this.audioService.unlock();
      if (this.stateMachine.getState() === 'HOME') {
        this.audioService.startHomeMusic();
      }
    }, { once: false });

    // Page visibility / backgrounding
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.stateMachine.getState() === 'PLAYING') {
        this.pauseGame();
      }
    });
  }

  private handleStateTransition(state: GameState): void {
    this.currentScreenContainer.innerHTML = '';

    if (state === 'HOME') {
      this.audioService.startHomeMusic();
      this.renderHomeScreen();
    } else {
      this.audioService.stopHomeMusic();

      switch (state) {
        case 'INSTRUCTIONS':
          this.renderInstructionsScreen();
          break;

        case 'COUNTDOWN':
          this.renderCountdownScreen();
          break;

        case 'PLAYING':
          this.renderGameplayScreen();
          break;

        case 'PAUSED':
          this.renderPauseModal();
          break;

        case 'GAME_OVER':
          this.renderGameOverScreen();
          break;

        case 'STATISTICS':
          this.renderStatisticsModal();
          break;

        case 'ACHIEVEMENTS':
          this.renderAchievementsModal();
          break;

        default:
          break;
      }
    }
  }

  /* ----------------------------------------------------
     SCREENS RENDERING
  ---------------------------------------------------- */
  private renderHomeScreen(): void {
    this.platform.gameplayStop();
    const isVeryHardUnlocked = this.achievementManager.isVeryHardUnlocked();

    new HomeScreen(
      this.currentScreenContainer,
      {
        onPlay: () => {
          this.audioService.playButtonClick();
          if (this.showInstructionsSetting) {
            this.stateMachine.setState('INSTRUCTIONS');
          } else {
            this.stateMachine.setState('COUNTDOWN');
          }
        },
        onOpenInstructions: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('INSTRUCTIONS');
        },
        onToggleSound: () => {
          const isNowOn = this.audioService.toggleSound();
          if (isNowOn) {
            this.audioService.playButtonClick();
            this.audioService.startHomeMusic();
          }
          this.saveCurrentProgress();
          this.renderHomeScreen();
        },
        onOpenAchievements: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('ACHIEVEMENTS');
        },
        onSelectDifficulty: (mode: DifficultyMode) => {
          if (mode === 'VERY_HARD' && !isVeryHardUnlocked) {
            this.audioService.playWrong();
            alert('Unlock 5 Achievements to play Very Hard mode!');
            return;
          }
          this.audioService.playButtonClick();
          this.activeDifficulty = mode;
          this.renderHomeScreen();
        },
        onOpenStats: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('STATISTICS');
        }
      },
      {
        isSoundOn: this.audioService.isEnabled(),
        isVeryHardUnlocked,
        currentDifficulty: this.activeDifficulty
      }
    );
  }

  private renderInstructionsScreen(): void {
    new InstructionsScreen(this.currentScreenContainer, () => {
      this.audioService.playButtonClick();
      this.stateMachine.setState('HOME');
    });
  }

  private renderCountdownScreen(): void {
    this.countdownScreen = new CountdownScreen(
      this.currentScreenContainer,
      () => {
        // Countdown completed -> begin active gameplay!
        this.startNewRun();
      },
      () => this.audioService.playCountdownTick(),
      () => this.audioService.playGo()
    );
    this.countdownScreen.start();
  }

  private startNewRun(): void {
    this.scoreManager.reset();
    this.streakManager.reset();
    this.questionGenerator.resetHistory();
    this.bonusesUsedInRun = 0;
    this.currentLevel = 1;

    // Start Authoritative Gameplay on CrazyGames
    this.platform.gameplayStart();
    this.stateMachine.setState('PLAYING');

    // Timer callbacks
    this.timer.setCallbacks(
      (tick: TimerTickData) => {
        if (this.gameplayScreen) {
          this.gameplayScreen.updateTimer(tick.percentage, tick.state);
        }
      },
      () => {
        // Round Time Over!
        this.onRoundFinished();
      }
    );

    this.timer.start();
    this.nextQuestion();

    // First time player answer guide on first ever question
    if (!this.tutorialCompleted) {
      window.setTimeout(() => {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.gameplayScreen?.showGuide('ANSWER');
        }
      }, 400);
    }
  }

  private renderGameplayScreen(): void {
    this.gameplayScreen = new GameplayScreen(
      this.currentScreenContainer,
      {
        onSelectAnswer: (choiceIndex: 0 | 1) => {
          this.handleAnswerSelected(choiceIndex);
        },
        onActivateTimeBonus: () => {
          this.handleTimeBonusUsed();
        },
        onExit: () => {
          this.pauseGame();
        }
      },
      this.activeDifficulty
    );

    if (this.currentQuestion) {
      this.gameplayScreen.setQuestion(this.currentQuestion);
    }
  }

  private nextQuestion(): void {
    this.currentQuestion = this.questionGenerator.generate(
      this.currentLevel,
      this.activeDifficulty
    );
    this.streakManager.onNewQuestion();

    if (this.gameplayScreen) {
      this.gameplayScreen.setQuestion(this.currentQuestion);
      this.updateGameplayHud();
    }
  }

  private handleAnswerSelected(choiceIndex: 0 | 1): void {
    if (!this.currentQuestion || this.stateMachine.getState() !== 'PLAYING') return;

    const isCorrect = choiceIndex === this.currentQuestion.correctIndex;

    if (isCorrect) {
      this.audioService.playCorrect();
      const currentStreak = this.streakManager.getStreak() + 1;
      this.scoreManager.addCorrect(currentStreak);
      const streakResult = this.streakManager.recordCorrectAnswer();

      if (streakResult.bonusReady) {
        this.audioService.playTimeBonusCharge();
      }

      // Check level up
      const currentScore = this.scoreManager.getScore();
      const newLevel = LevelProgression.getLevelForScore(currentScore);
      const isLevelUp = newLevel > this.currentLevel;
      if (isLevelUp) {
        this.currentLevel = newLevel;
        this.audioService.playLevelUp();
      }

      this.gameplayScreen?.showAnswerFeedback(choiceIndex, true, streakResult.streak, isLevelUp);
      this.updateGameplayHud();

      // Onboarding Step 2: Show streak pointer
      if (!this.tutorialCompleted && !this.tutorialStreakShown && currentStreak >= 3) {
        this.tutorialStreakShown = true;
        this.gameplayScreen?.showGuide('STREAK');
        window.setTimeout(() => {
          this.gameplayScreen?.hideGuide();
        }, 2200);
      }

      // Onboarding Step 3: Show Time Bonus pointer
      if (!this.tutorialCompleted && !this.tutorialBonusShown && streakResult.bonusReady) {
        this.tutorialBonusShown = true;
        window.setTimeout(() => {
          if (this.stateMachine.getState() === 'PLAYING') {
            this.gameplayScreen?.showGuide('BONUS');
          }
        }, 300);
      }

      window.setTimeout(() => {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.nextQuestion();
        }
      }, 250);
    } else {
      this.audioService.playWrong();
      this.scoreManager.addWrong();
      this.streakManager.recordWrongAnswer();

      this.gameplayScreen?.showAnswerFeedback(choiceIndex, false, 0);
      this.updateGameplayHud();

      window.setTimeout(() => {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.nextQuestion();
        }
      }, 280);
    }
  }

  private handleTimeBonusUsed(): void {
    if (this.stateMachine.getState() !== 'PLAYING') return;
    const consumed = this.streakManager.consumeTimeBonus();
    if (consumed) {
      this.bonusesUsedInRun++;
      this.audioService.playTimeBonusUse();
      this.timer.addBonusSeconds(GAME_CONFIG.timeBonusSeconds);
      this.gameplayScreen?.showTimeBonusActivated();
      this.updateGameplayHud();

      // Tutorial complete!
      if (!this.tutorialCompleted) {
        this.tutorialCompleted = true;
        this.saveCurrentProgress();
      }
    }
  }

  private updateGameplayHud(): void {
    if (!this.gameplayScreen) return;
    this.gameplayScreen.updateStats({
      score: this.scoreManager.getScore(),
      streak: this.streakManager.getStreak(),
      stars: this.scoreManager.calculateStars(),
      level: this.currentLevel,
      timeBonusCharges: this.streakManager.getTimeBonusCharges()
    });
  }

  private pauseGame(): void {
    if (this.stateMachine.getState() !== 'PLAYING') return;
    this.timer.pause();
    this.platform.gameplayStop();
    this.stateMachine.setState('PAUSED');
  }

  private resumeGame(): void {
    this.platform.gameplayStart();
    this.stateMachine.setState('PLAYING');
    this.timer.resume();
  }

  private renderPauseModal(): void {
    new PauseModal(
      this.currentScreenContainer,
      () => {
        this.audioService.playButtonClick();
        this.resumeGame();
      },
      () => {
        this.audioService.playButtonClick();
        this.timer.stop();
        this.platform.gameplayStop();
        this.stateMachine.setState('HOME');
      }
    );
  }

  private async onRoundFinished(): Promise<void> {
    this.timer.stop();
    this.platform.gameplayStop();
    this.audioService.playGameOver();

    const summary = this.scoreManager.getSummary();
    const streak = this.streakManager.getBestStreak();

    // 1. Update Lifetime Statistics
    this.statisticsManager.recordGame({
      score: summary.score,
      level: this.currentLevel,
      streak: streak,
      correct: summary.correctCount,
      wrong: summary.wrongCount,
      stars: summary.starsEarned,
      bonusesUsed: this.bonusesUsedInRun
    });

    // 2. Evaluate Achievements
    this.achievementManager.evaluateRun({
      runScore: summary.score,
      runCorrect: summary.correctCount,
      runWrong: summary.wrongCount,
      runStreak: streak,
      runLevel: this.currentLevel,
      runStars: summary.starsEarned,
      runBonusesUsed: this.bonusesUsedInRun,
      totalLifetimeCorrect: this.statisticsManager.getStats().correctAnswers
    });

    // 3. Save progress
    await this.saveCurrentProgress();

    // 4. Optional CrazyGames Midgame Ad Break
    await this.platform.requestMidgameAd();

    // 5. Render Game Over Screen
    this.stateMachine.setState('GAME_OVER');
  }

  private renderGameOverScreen(): void {
    const summary = this.scoreManager.getSummary();
    const stats = this.statisticsManager.getStats();
    const isNewBest = summary.score >= stats.bestScore && summary.score > 0;

    new GameOverScreen(
      this.currentScreenContainer,
      {
        onHome: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('HOME');
        },
        onRestart: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('COUNTDOWN');
        }
      },
      {
        summary,
        level: this.currentLevel,
        isNewBest
      }
    );
  }

  private renderStatisticsModal(): void {
    const stats = this.statisticsManager.getStats();
    const accuracy = this.statisticsManager.getAccuracy();

    new StatisticsModal(
      this.currentScreenContainer,
      stats,
      accuracy,
      () => {
        this.audioService.playButtonClick();
        this.stateMachine.setState('HOME');
      },
      () => {
        this.audioService.playButtonClick();
        this.statisticsManager.reset();
        this.saveCurrentProgress();
        this.renderStatisticsModal();
      }
    );
  }

  private renderAchievementsModal(): void {
    const achievements = this.achievementManager.getAll();
    const isVeryHardUnlocked = this.achievementManager.isVeryHardUnlocked();

    new AchievementsModal(
      this.currentScreenContainer,
      achievements,
      isVeryHardUnlocked,
      () => {
        this.audioService.playButtonClick();
        this.stateMachine.setState('HOME');
      }
    );
  }

  private async saveCurrentProgress(): Promise<void> {
    await this.saveService.save({
      sound: this.audioService.isEnabled(),
      showInstructions: this.showInstructionsSetting,
      stats: this.statisticsManager.getStats(),
      achievements: this.achievementManager.serialize(),
      veryHardUnlocked: this.achievementManager.isVeryHardUnlocked(),
      tutorialCompleted: this.tutorialCompleted
    });
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new MathDashApp();
  app.init().catch(err => console.error('Math Dash initialization error:', err));
});
