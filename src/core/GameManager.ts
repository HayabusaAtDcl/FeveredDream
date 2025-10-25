import { engine } from '@dcl/sdk/ecs'
import { GameState, StageType, GameConfig } from '../types'
import { EntityManager } from './EntityManager'
import { StageManager } from './StageManager'
import { AudioManager } from './AudioManager'
import { ErrorHandler } from './ErrorHandler'

/**
 * Centralized Game Management System
 * Coordinates all game systems and manages the overall game state
 */
export class GameManager {
  private static instance: GameManager | null = null
  
  // Core systems
  private entityManager: EntityManager
  private stageManager: StageManager
  private audioManager: AudioManager
  private errorHandler: ErrorHandler

  // Game state
  private gameState: GameState
  private config: GameConfig
  private isInitialized: boolean = false
  private updateSystems: Array<() => void> = []

  constructor() {
    this.entityManager = EntityManager.getInstance()
    this.stageManager = StageManager.getInstance()
    this.audioManager = AudioManager.getInstance()
    this.errorHandler = ErrorHandler.getInstance()

    this.gameState = {
      gameStarted: false,
      gameOver: false,
      activateAngels: false,
      currentStage: 'stage1'
    }

    this.config = {
      maxActiveCandles: 1,
      candleDuration: 45,
      angelActivationDelay: 1000,
      fogRotationSpeed: 0.02,
      performance: {
        maxEntities: 1000,
        updateRate: 60,
        cleanupInterval: 5000
      }
    }
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager()
    }
    return GameManager.instance
  }

  /**
   * Initialize the game manager
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing GameManager...')

      // Initialize all systems
      this.entityManager = EntityManager.getInstance()
      this.stageManager = StageManager.getInstance()
      this.audioManager = AudioManager.getInstance()
      this.errorHandler = ErrorHandler.getInstance()

      // Set up update systems
      this.setupUpdateSystems()

      // Initialize stage manager
      this.stageManager.initialize()

      this.isInitialized = true
      console.log('GameManager initialized successfully')
    } catch (error) {
      this.errorHandler.log(error as Error, 'GameManager Initialization')
      throw error
    }
  }

  /**
   * Set up update systems
   */
  private setupUpdateSystems(): void {
    // Health check system
    const healthCheckSystem = () => {
      if (!this.errorHandler.isSystemHealthy()) {
        console.log('System health issues detected')
      }
    }

    this.updateSystems.push(healthCheckSystem)
  }

  /**
   * Start the game
   */
  public async startGame(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log('Starting game...')
      
      // Update game state
      this.updateGameState({ gameStarted: true })
      
      // Start with stage 1
      await this.stageManager.transitionToStage('stage1')
      
      // Start audio
      this.audioManager.playAudio('sounds/heart.mp3')
      this.audioManager.playAudio('sounds/wind.mp3')
      
      console.log('Game started successfully')
    } catch (error) {
      this.errorHandler.log(error as Error, 'Game Start')
      throw error
    }
  }

  /**
   * Update game state
   */
  public updateGameState(updates: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...updates }
    this.stageManager.updateGameState(updates)
  }

  /**
   * Get current game state
   */
  public getGameState(): GameState {
    return { ...this.gameState }
  }

  /**
   * Transition to next stage
   */
  public async transitionToNextStage(): Promise<void> {
    try {
      const nextStage = this.stageManager.getNextStage()
      if (nextStage) {
        await this.stageManager.transitionToStage(nextStage)
        console.log(`Transitioned to ${nextStage}`)
      } else {
        console.log('No next stage available')
      }
    } catch (error) {
      this.errorHandler.log(error as Error, 'Stage Transition')
      throw error
    }
  }

  /**
   * Handle game over
   */
  public handleGameOver(): void {
    console.log('Game over triggered')
    this.updateGameState({ gameOver: true })
    
    // Stop all audio
    this.audioManager.stopAll()
    
    // Clean up entities
    this.entityManager.cleanup()
  }

  /**
   * Reset game
   */
  public resetGame(): void {
    console.log('Resetting game...')
    
    // Reset game state
    this.gameState = {
      gameStarted: false,
      gameOver: false,
      activateAngels: false,
      currentStage: 'stage1'
    }
    
    // Reset all systems
    this.stageManager.reset()
    this.audioManager.cleanup()
    this.entityManager.cleanup()
    this.errorHandler.clearErrorLog()
    
    console.log('Game reset completed')
  }

  /**
   * Update game systems
   */
  public update(dt: number): void {
    if (!this.isInitialized) return

    try {
      // Run update systems
      for (const system of this.updateSystems) {
        system()
      }
    } catch (error) {
      this.errorHandler.log(error as Error, 'Game Update')
    }
  }

  /**
   * Get system statistics
   */
  public getSystemStats(): {
    gameState: GameState
    entityStats: any
    audioStats: any
    errorStats: any
  } {
    return {
      gameState: this.getGameState(),
      entityStats: this.entityManager.getStats(),
      audioStats: this.audioManager.getStats(),
      errorStats: this.errorHandler.getErrorStats()
    }
  }

  /**
   * Get health report
   */
  public getHealthReport(): {
    healthy: boolean
    errorCount: number
  } {
    const errorStats = this.errorHandler.getErrorStats()
    
    return {
      healthy: this.errorHandler.isSystemHealthy(),
      errorCount: errorStats.total
    }
  }

  /**
   * Clean up game manager
   */
  public cleanup(): void {
    console.log('Cleaning up GameManager...')
    
    // Clean up all systems
    this.entityManager.cleanup()
    this.audioManager.cleanup()
    this.errorHandler.clearErrorLog()
    
    // Clear update systems
    this.updateSystems.length = 0
    
    this.isInitialized = false
    console.log('GameManager cleanup completed')
  }

  /**
   * Get configuration
   */
  public getConfig(): GameConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<GameConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}
