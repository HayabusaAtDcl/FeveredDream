import { engine, AudioSource } from '@dcl/sdk/ecs'
import { AudioManager } from '../core/AudioManager'
import { ErrorHandler } from '../core/ErrorHandler'
import { GameManager } from '../core/GameManager'
import * as utils from '@dcl-sdk/utils'

/**
 * Optimized Audio System
 * Manages audio playback, transitions, and stage-specific audio
 */
export class AudioSystem {
  private static instance: AudioSystem | null = null
  private audioManager: AudioManager
  private gameManager: GameManager
  private errorHandler: ErrorHandler
  
  // Audio state
  private currentStage: string = 'stage1'
  private isPlaying: boolean = false

  constructor() {
    this.audioManager = AudioManager.getInstance()
    this.gameManager = GameManager.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
  }

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem()
    }
    return AudioSystem.instance
  }

  /**
   * Initialize audio system
   */
  public initialize(): void {
    try {
      console.log('Initializing AudioSystem...')
      
      // Start with stage 1 audio
      this.playStageAudio('stage1')
      
      this.isPlaying = true
      console.log('AudioSystem initialized')
    } catch (error) {
      this.errorHandler.log(error as Error, 'Audio System Initialization')
    }
  }

  /**
   * Play audio for a specific stage
   */
  public playStageAudio(stage: string): void {
    try {
      console.log(`Playing audio for stage: ${stage}`)
      
      // Stop all current audio
      this.audioManager.stopAll()
      
      switch (stage) {
        case 'stage1':
          this.playStage1Audio()
          break
        case 'stage2':
          this.playStage2Audio()
          break
        case 'stage3':
          this.playStage3Audio()
          break
        case 'stage4':
          this.playStage4Audio()
          break
        default:
          console.log(`Unknown stage: ${stage}`)
      }
      
      this.currentStage = stage
    } catch (error) {
      this.errorHandler.log(error as Error, 'Stage Audio Playback')
    }
  }

  /**
   * Play Stage 1 audio (Graveyard)
   */
  private playStage1Audio(): void {
    this.audioManager.playAudio('sounds/heart.mp3')
    this.audioManager.playAudio('sounds/wind.mp3')
  }

  /**
   * Play Stage 2 audio (Grim Reaper Boat)
   */
  private playStage2Audio(): void {
    this.audioManager.playAudio('sounds/heart.mp3')
    this.audioManager.playAudio('sounds/creaky.mp3')
    this.audioManager.playAudio('sounds/whisper.mp3')
  }

  /**
   * Play Stage 3 audio (Spiral)
   */
  private playStage3Audio(): void {
    this.audioManager.playAudio('sounds/heart.mp3')
    this.audioManager.playAudio('sounds/dungeon.mp3')
  }

  /**
   * Play Stage 4 audio (Final)
   */
  private playStage4Audio(): void {
    this.audioManager.playAudio('sounds/heart.mp3')
    this.audioManager.playAudio('sounds/final.mp3')
  }

  /**
   * Play random ambience loop
   */
  public playRandomAmbienceLoop(): void {
    try {
      // Stop any currently playing ambience
      this.audioManager.stopAllInCategory('ambience')

      // Get random ambience
      const ambienceSounds = ['sounds/ambience1.mp3', 'sounds/ambience2.mp3', 'sounds/ambience3.mp3', 'sounds/ambience4.mp3']
      const randomIndex = Math.floor(Math.random() * ambienceSounds.length)
      const chosenSound = ambienceSounds[randomIndex]

      // Play the chosen sound
      this.audioManager.playAudio(chosenSound, { loop: false })

      console.log(`🎵 Playing ambience ${randomIndex + 1}`)

      // Schedule next ambience
      const clipDuration = 10 + Math.random() * 10
      const gap = 3 + Math.random() * 5
      
      utils.timers.setTimeout(() => {
        this.playRandomAmbienceLoop()
      }, (clipDuration + gap) * 1000)

    } catch (error) {
      this.errorHandler.log(error as Error, 'Random Ambience Loop')
    }
  }

  /**
   * Play effect sound
   */
  public playEffect(soundName: string, config?: { volume?: number; loop?: boolean }): void {
    try {
      const soundMap: Record<string, string> = {
        'creaky': 'sounds/creaky.mp3',
        'whisper': 'sounds/whisper.mp3',
        'angry': 'sounds/angry.mp3',
        'dungeon': 'sounds/dungeon.mp3',
        'final': 'sounds/final.mp3'
      }

      const soundUrl = soundMap[soundName]
      if (soundUrl) {
        this.audioManager.playAudio(soundUrl, config)
      } else {
        console.log(`Unknown effect sound: ${soundName}`)
      }
    } catch (error) {
      this.errorHandler.log(error as Error, 'Effect Sound Playback')
    }
  }

  /**
   * Stop effect sound
   */
  public stopEffect(soundName: string): void {
    try {
      const soundMap: Record<string, string> = {
        'creaky': 'sounds/creaky.mp3',
        'whisper': 'sounds/whisper.mp3',
        'angry': 'sounds/angry.mp3',
        'dungeon': 'sounds/dungeon.mp3',
        'final': 'sounds/final.mp3'
      }

      const soundUrl = soundMap[soundName]
      if (soundUrl) {
        this.audioManager.stopAudio(soundUrl)
      }
    } catch (error) {
      this.errorHandler.log(error as Error, 'Effect Sound Stop')
    }
  }

  /**
   * Set volume for all audio
   */
  public setMasterVolume(volume: number): void {
    try {
      this.audioManager.setCategoryVolume('ambience', volume)
      this.audioManager.setCategoryVolume('effects', volume)
      this.audioManager.setCategoryVolume('music', volume)
    } catch (error) {
      this.errorHandler.log(error as Error, 'Master Volume Set')
    }
  }

  /**
   * Set volume for a specific category
   */
  public setCategoryVolume(category: 'ambience' | 'effects' | 'music', volume: number): void {
    try {
      this.audioManager.setCategoryVolume(category, volume)
    } catch (error) {
      this.errorHandler.log(error as Error, 'Category Volume Set')
    }
  }

  /**
   * Stop all audio
   */
  public stopAll(): void {
    try {
      this.audioManager.stopAll()
      this.isPlaying = false
    } catch (error) {
      this.errorHandler.log(error as Error, 'Stop All Audio')
    }
  }

  /**
   * Pause all audio
   */
  public pauseAll(): void {
    try {
      this.audioManager.stopAll()
    } catch (error) {
      this.errorHandler.log(error as Error, 'Pause All Audio')
    }
  }

  /**
   * Resume audio for current stage
   */
  public resume(): void {
    try {
      if (this.isPlaying) {
        this.playStageAudio(this.currentStage)
      }
    } catch (error) {
      this.errorHandler.log(error as Error, 'Resume Audio')
    }
  }

  /**
   * Update audio system
   */
  public update(dt: number): void {
    // Audio system doesn't need frequent updates
    // This method is here for consistency with other systems
  }

  /**
   * Clean up audio system
   */
  public cleanup(): void {
    try {
      this.stopAll()
      this.audioManager.cleanup()
      this.isPlaying = false
      console.log('AudioSystem cleaned up')
    } catch (error) {
      this.errorHandler.log(error as Error, 'Audio System Cleanup')
    }
  }

  /**
   * Get audio system statistics
   */
  public getStats(): {
    currentStage: string
    isPlaying: boolean
    audioStats: any
  } {
    return {
      currentStage: this.currentStage,
      isPlaying: this.isPlaying,
      audioStats: this.audioManager.getStats()
    }
  }

  /**
   * Check if audio is healthy
   */
  public isHealthy(): boolean {
    const stats = this.audioManager.getStats()
    return stats.playing > 0 || this.currentStage === 'stage1'
  }
}
