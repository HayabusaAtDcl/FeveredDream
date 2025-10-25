import { engine } from '@dcl/sdk/ecs'
import { StageType, GameState, StageConfig } from '../types'
import { EntityManager } from './EntityManager'

/**
 * Centralized Stage Management System
 * Handles stage transitions, cleanup, and state management
 */
export class StageManager {
  private static instance: StageManager | null = null
  private currentStage: StageType | null = null
  private stageHistory: StageType[] = []
  private entityManager: EntityManager
  private gameState: GameState

  constructor() {
    this.entityManager = EntityManager.getInstance()
    this.gameState = {
      gameStarted: false,
      gameOver: false,
      activateAngels: false,
      currentStage: 'stage1'
    }
  }

  public static getInstance(): StageManager {
    if (!StageManager.instance) {
      StageManager.instance = new StageManager()
    }
    return StageManager.instance
  }

  /**
   * Initialize the stage manager
   */
  public initialize(): void {
    console.log('StageManager initialized')
  }

  /**
   * Get current stage
   */
  public getCurrentStage(): StageType | null {
    return this.currentStage
  }

  /**
   * Get game state
   */
  public getGameState(): GameState {
    return { ...this.gameState }
  }

  /**
   * Update game state
   */
  public updateGameState(updates: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...updates }
  }

  /**
   * Transition to a new stage
   */
  public async transitionToStage(stage: StageType): Promise<void> {
    try {
      console.log(`Transitioning from ${this.currentStage} to ${stage}`)
      
      // Clean up current stage
      if (this.currentStage) {
        await this.cleanupCurrentStage()
      }

      // Update state
      this.stageHistory.push(this.currentStage || 'stage1')
      this.currentStage = stage
      this.updateGameState({ currentStage: stage })

      // Load new stage
      await this.loadStage(stage)
      
      console.log(`Successfully transitioned to ${stage}`)
    } catch (error) {
      console.error(`Failed to transition to ${stage}:`, error)
      throw error
    }
  }

  /**
   * Load a specific stage
   */
  private async loadStage(stage: StageType): Promise<void> {
    switch (stage) {
      case 'stage1':
        await this.loadStage1()
        break
      case 'stage2':
        await this.loadStage2()
        break
      case 'stage3':
        await this.loadStage3()
        break
      case 'stage4':
        await this.loadStage4()
        break
      default:
        throw new Error(`Unknown stage: ${stage}`)
    }
  }

  /**
   * Load Stage 1 (Graveyard)
   */
  private async loadStage1(): Promise<void> {
    const { SetStage1Scene } = await import('../stage')
    SetStage1Scene()
  }

  /**
   * Load Stage 2 (Grim Reaper Boat)
   */
  private async loadStage2(): Promise<void> {
    const { createGrimReaperBoatScene } = await import('../stage2')
    createGrimReaperBoatScene()
  }

  /**
   * Load Stage 3 (Spiral)
   */
  private async loadStage3(): Promise<void> {
    const { createStage3Scene } = await import('../stage3')
    createStage3Scene()
  }

  /**
   * Load Stage 4 (Final)
   */
  private async loadStage4(): Promise<void> {
    const { createStage4Scene } = await import('../stage4')
    createStage4Scene()
  }

  /**
   * Clean up current stage
   */
  private async cleanupCurrentStage(): Promise<void> {
    if (!this.currentStage) return

    try {
      switch (this.currentStage) {
        case 'stage1':
          await this.cleanupStage1()
          break
        case 'stage2':
          await this.cleanupStage2()
          break
        case 'stage3':
          await this.cleanupStage3()
          break
        case 'stage4':
          await this.cleanupStage4()
          break
      }

      // Clean up entity manager
      this.entityManager.cleanup()
      
      console.log(`Cleaned up ${this.currentStage}`)
    } catch (error) {
      console.error(`Failed to cleanup ${this.currentStage}:`, error)
    }
  }

  /**
   * Clean up Stage 1
   */
  private async cleanupStage1(): Promise<void> {
    const { cleanupStage } = await import('../stage')
    // Note: cleanupStage function needs to be exported from stage.ts
    // cleanupStage()
  }

  /**
   * Clean up Stage 2
   */
  private async cleanupStage2(): Promise<void> {
    const { cleanupGrimReaperBoatScene } = await import('../stage2')
    cleanupGrimReaperBoatScene()
  }

  /**
   * Clean up Stage 3
   */
  private async cleanupStage3(): Promise<void> {
    const { cleanupStage3 } = await import('../stage3')
    cleanupStage3()
  }

  /**
   * Clean up Stage 4
   */
  private async cleanupStage4(): Promise<void> {
    const { cleanupStage4 } = await import('../stage4')
    cleanupStage4()
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this.currentStage = null
    this.stageHistory = []
    this.gameState = {
      gameStarted: false,
      gameOver: false,
      activateAngels: false,
      currentStage: 'stage1'
    }
    this.entityManager.cleanup()
  }

  /**
   * Get stage history
   */
  public getStageHistory(): StageType[] {
    return [...this.stageHistory]
  }

  /**
   * Check if stage is valid
   */
  public isValidStage(stage: string): stage is StageType {
    return ['stage1', 'stage2', 'stage3', 'stage4'].includes(stage)
  }

  /**
   * Get next stage in sequence
   */
  public getNextStage(): StageType | null {
    const stageOrder: StageType[] = ['stage1', 'stage2', 'stage3', 'stage4']
    const currentIndex = stageOrder.indexOf(this.currentStage || 'stage1')
    
    if (currentIndex < stageOrder.length - 1) {
      return stageOrder[currentIndex + 1]
    }
    
    return null
  }

  /**
   * Get previous stage
   */
  public getPreviousStage(): StageType | null {
    if (this.stageHistory.length > 0) {
      return this.stageHistory[this.stageHistory.length - 1]
    }
    return null
  }
}
