import { engine, Entity, Transform, pointerEventsSystem, InputAction, GltfContainer, Animator } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { EntityManager } from '../core/EntityManager'
import { CandleState } from '../types'
import { GameManager } from '../core/GameManager'
import { ErrorHandler } from '../core/ErrorHandler'

/**
 * Optimized Candle System
 * Manages candle entities, interactions, and state
 */
export class CandleSystem {
  private static instance: CandleSystem | null = null
  private entityManager: EntityManager
  private gameManager: GameManager
  private errorHandler: ErrorHandler
  
  // Configuration
  private readonly MAX_ACTIVE_CANDLES = 1
  private readonly CANDLE_DURATION = 45 // seconds
  
  // State
  private candles: CandleState[] = []
  private activateAngels = false
  private gameOver = false

  constructor() {
    this.entityManager = EntityManager.getInstance()
    this.gameManager = GameManager.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
  }

  public static getInstance(): CandleSystem {
    if (!CandleSystem.instance) {
      CandleSystem.instance = new CandleSystem()
    }
    return CandleSystem.instance
  }

  /**
   * Create a new candle at the specified position
   */
  public createCandle(position: Vector3): Entity | null {
    try {
      this.errorHandler.validatePosition(position)
      
      const candle = engine.addEntity()
      
      // Set up transform
      Transform.createOrReplace(candle, {
        position,
        scale: Vector3.create(0.3, 0.3, 0.3)
      })

      // Set up GLTF container
      GltfContainer.createOrReplace(candle, {
        src: "models/candle.glb"
      })

      // Set up animations
      Animator.create(candle, {
        states: [
          {
            clip: 'Flame',
            playing: false,
            loop: false
          },
          {
            clip: 'Extinguish',
            playing: true,
            loop: false
          },
          {
            clip: 'FlameIdle',
            playing: false,
            loop: true
          }
        ]
      })

      // Create candle state
      const candleState: CandleState = {
        entity: candle,
        timer: 0,
        active: false
      }

      this.candles.push(candleState)

      // Set up pointer interaction
      this.setupCandleInteraction(candle)

      console.log(`Candle created at position: ${position.x}, ${position.y}, ${position.z}`)
      return candle

    } catch (error) {
      this.errorHandler.log(error as Error, 'Candle Creation')
      return null
    }
  }

  /**
   * Set up pointer interaction for a candle
   */
  private setupCandleInteraction(candle: Entity): void {
    pointerEventsSystem.onPointerDown(
      {
        entity: candle,
        opts: { 
          button: InputAction.IA_PRIMARY, 
          hoverText: 'Light Candle' 
        }
      },
      () => {
        this.handleCandleClick(candle)
      }
    )
  }

  /**
   * Handle candle click interaction
   */
  private handleCandleClick(candle: Entity): void {
    try {
      const activeCount = this.candles.filter(c => c.active).length
      
      if (activeCount >= this.MAX_ACTIVE_CANDLES) {
        console.log('🔥 You already have the maximum number of candles lit!')
        return
      }

      const candleState = this.candles.find(c => c.entity === candle)
      if (candleState && !candleState.active) {
        this.lightCandle(candleState)
      }
    } catch (error) {
      this.errorHandler.log(error as Error, 'Candle Interaction')
    }
  }

  /**
   * Light a candle
   */
  private lightCandle(candleState: CandleState): void {
    try {
      candleState.active = true
      candleState.timer = this.CANDLE_DURATION
      
      // Play lighting animation
      Animator.getClip(candleState.entity, 'Extinguish').playing = false
      Animator.getClip(candleState.entity, 'Flame').playing = true

      // Transition to idle animation after lighting
      utils.timers.setTimeout(() => {
        Animator.getClip(candleState.entity, 'FlameIdle').playing = true
      }, 500)

      console.log(`🕯️ Candle lit for ${this.CANDLE_DURATION}s.`)
      
      // Update game state
      this.updateAngelsState()
      
    } catch (error) {
      this.errorHandler.log(error as Error, 'Light Candle')
    }
  }

  /**
   * Extinguish a candle
   */
  private extinguishCandle(candleState: CandleState): void {
    try {
      candleState.active = false
      candleState.timer = 0
      
      // Play extinguish animation
      Animator.getClip(candleState.entity, 'Flame').playing = false
      Animator.getClip(candleState.entity, 'FlameIdle').playing = false
      Animator.getClip(candleState.entity, 'Extinguish').playing = true
      
      console.log('💨 Candle expired and reappeared.')
      
      // Update game state
      this.updateAngelsState()
      
    } catch (error) {
      this.errorHandler.log(error as Error, 'Extinguish Candle')
    }
  }

  /**
   * Force light a specific candle
   */
  public forceLightCandle(candle: Entity): void {
    const candleState = this.candles.find(c => c.entity === candle)
    if (candleState && !candleState.active) {
      this.lightCandle(candleState)
    }
  }

  /**
   * Update angels state based on candle status
   */
  private updateAngelsState(): void {
    const anyActive = this.candles.some(c => c.active)
    this.activateAngels = !anyActive
    
    if (this.activateAngels) {
      console.log('😈 All candles out — activate angels!')
    }
    
    // Update game manager state
    this.gameManager.updateGameState({ activateAngels: this.activateAngels })
  }

  /**
   * Update candle system
   */
  public update(dt: number): void {
    try {
      if (this.gameOver) return

      // Update candle timers
      for (const candle of this.candles) {
        if (candle.active) {
          candle.timer -= dt
          if (candle.timer <= 0) {
            this.extinguishCandle(candle)
          }
        }
      }

    } catch (error) {
      this.errorHandler.log(error as Error, 'Candle System Update')
    }
  }

  /**
   * Set game over state
   */
  public setGameOver(): void {
    this.gameOver = true
    this.gameManager.updateGameState({ gameOver: true })
  }

  /**
   * Get active candle count
   */
  public getActiveCandleCount(): number {
    return this.candles.filter(c => c.active).length
  }

  /**
   * Get total candle count
   */
  public getTotalCandleCount(): number {
    return this.candles.length
  }

  /**
   * Check if angels should be activated
   */
  public shouldActivateAngels(): boolean {
    return this.activateAngels
  }

  /**
   * Clean up all candles
   */
  public cleanup(): void {
    try {
      for (const candle of this.candles) {
        engine.removeEntity(candle.entity)
      }
      this.candles.length = 0
      this.activateAngels = false
      this.gameOver = false
      
      console.log('Candle system cleaned up')
    } catch (error) {
      this.errorHandler.log(error as Error, 'Candle System Cleanup')
    }
  }

  /**
   * Get candle system statistics
   */
  public getStats(): {
    total: number
    active: number
    inactive: number
    angelsActivated: boolean
  } {
    return {
      total: this.candles.length,
      active: this.candles.filter(c => c.active).length,
      inactive: this.candles.filter(c => !c.active).length,
      angelsActivated: this.activateAngels
    }
  }
}
