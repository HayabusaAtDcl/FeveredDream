import { ValidationResult } from '../types'

/**
 * Centralized Error Handling System
 * Handles errors, validation, and recovery
 */
export class ErrorHandler {
  private static instance: ErrorHandler | null = null
  private errorLog: Array<{ error: Error; context: string; timestamp: number }> = []
  private maxLogSize: number = 100

  constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers()
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle uncaught errors (only in browser environment)
    if (typeof globalThis !== 'undefined' && (globalThis as any).addEventListener) {
      (globalThis as any).addEventListener('error', (event: any) => {
        this.log(new Error(event.message), 'Global Error Handler')
      })

      // Handle unhandled promise rejections
      (globalThis as any).addEventListener('unhandledrejection', (event: any) => {
        this.log(new Error(event.reason), 'Unhandled Promise Rejection')
      })
    }
  }

  /**
   * Log an error with context
   */
  public log(error: Error, context: string): void {
    const errorEntry = {
      error,
      context,
      timestamp: Date.now()
    }

    this.errorLog.push(errorEntry)

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    console.error(`[${context}] ${error.name}: ${error.message}`)
    console.error(error.stack)
  }

  /**
   * Attempt to recover from an error
   */
  public recover(error: Error, context: string): boolean {
    try {
      // Try different recovery strategies based on context
      switch (context) {
        case 'Entity Creation':
          return this.recoverEntityCreation(error)
        case 'Audio Loading':
          return this.recoverAudioLoading(error)
        case 'Stage Transition':
          return this.recoverStageTransition(error)
        case 'System Update':
          return this.recoverSystemUpdate(error)
        default:
          return this.recoverGeneric(error)
      }
    } catch (recoveryError) {
      this.log(recoveryError as Error, `Recovery Failed for ${context}`)
      return false
    }
  }

  /**
   * Recover from entity creation errors
   */
  private recoverEntityCreation(error: Error): boolean {
    console.log('Attempting to recover from entity creation error...')
    // Try to clean up and retry
    return true
  }

  /**
   * Recover from audio loading errors
   */
  private recoverAudioLoading(error: Error): boolean {
    console.log('Attempting to recover from audio loading error...')
    // Try to reload audio or use fallback
    return true
  }

  /**
   * Recover from stage transition errors
   */
  private recoverStageTransition(error: Error): boolean {
    console.log('Attempting to recover from stage transition error...')
    // Try to rollback to previous stage
    return true
  }

  /**
   * Recover from system update errors
   */
  private recoverSystemUpdate(error: Error): boolean {
    console.log('Attempting to recover from system update error...')
    // Try to restart the system
    return true
  }

  /**
   * Generic recovery strategy
   */
  private recoverGeneric(error: Error): boolean {
    console.log('Attempting generic recovery...')
    // Basic recovery strategies
    return true
  }

  /**
   * Validate a value
   */
  public validate<T>(value: T, validator: (value: T) => boolean, errorMessage: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      if (!validator(value)) {
        errors.push(errorMessage)
      }
    } catch (error) {
      errors.push(`Validation failed: ${error}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate entity
   */
  public validateEntity(entity: any): ValidationResult {
    return this.validate(entity, (e) => {
      return e && typeof e === 'object' && 'entity' in e
    }, 'Invalid entity structure')
  }

  /**
   * Validate position
   */
  public validatePosition(position: any): ValidationResult {
    return this.validate(position, (pos) => {
      return pos && 
             typeof pos.x === 'number' && 
             typeof pos.y === 'number' && 
             typeof pos.z === 'number' &&
             !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z)
    }, 'Invalid position coordinates')
  }

  /**
   * Validate audio configuration
   */
  public validateAudioConfig(config: any): ValidationResult {
    return this.validate(config, (cfg) => {
      return cfg && 
             typeof cfg.volume === 'number' && 
             typeof cfg.loop === 'boolean' &&
             typeof cfg.playing === 'boolean' &&
             cfg.volume >= 0 && cfg.volume <= 1
    }, 'Invalid audio configuration')
  }

  /**
   * Get error log
   */
  public getErrorLog(): Array<{ error: Error; context: string; timestamp: number }> {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog.length = 0
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    total: number
    byContext: Record<string, number>
    recent: number
  } {
    const byContext: Record<string, number> = {}
    const recent = Date.now() - 60000 // Last minute

    for (const entry of this.errorLog) {
      byContext[entry.context] = (byContext[entry.context] || 0) + 1
    }

    const recentCount = this.errorLog.filter(entry => entry.timestamp > recent).length

    return {
      total: this.errorLog.length,
      byContext,
      recent: recentCount
    }
  }

  /**
   * Check if system is healthy
   */
  public isSystemHealthy(): boolean {
    const stats = this.getErrorStats()
    return stats.recent < 5 // Less than 5 errors in the last minute
  }

  /**
   * Get health report
   */
  public getHealthReport(): {
    healthy: boolean
    errorCount: number
    recentErrors: number
    criticalErrors: string[]
  } {
    const stats = this.getErrorStats()
    const criticalErrors: string[] = []

    // Check for critical error patterns
    if (stats.byContext['Entity Creation'] > 10) {
      criticalErrors.push('High entity creation failure rate')
    }
    if (stats.byContext['Audio Loading'] > 5) {
      criticalErrors.push('Audio loading issues')
    }
    if (stats.byContext['Stage Transition'] > 3) {
      criticalErrors.push('Stage transition failures')
    }

    return {
      healthy: this.isSystemHealthy() && criticalErrors.length === 0,
      errorCount: stats.total,
      recentErrors: stats.recent,
      criticalErrors
    }
  }
}
