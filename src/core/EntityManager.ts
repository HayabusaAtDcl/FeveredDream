import { engine, Entity } from '@dcl/sdk/ecs'
import { EntityStatus, EntityPool, EntityManager as IEntityManager, CandleState } from '../types'

/**
 * Centralized Entity Management System
 * Handles entity pooling, lifecycle, and cleanup for better performance
 */
export class EntityManager implements IEntityManager {
  public walls: EntityPool<EntityStatus>
  public floors: EntityPool<EntityStatus>
  public pillars: EntityPool<EntityStatus>
  public trees: EntityPool<EntityStatus>
  public candles: EntityPool<CandleState>
  public skeletons: EntityPool<EntityStatus>
  public ghosts: EntityPool<EntityStatus>

  private static instance: EntityManager | null = null

  constructor() {
    this.walls = this.createPool<EntityStatus>(100)
    this.floors = this.createPool<EntityStatus>(200)
    this.pillars = this.createPool<EntityStatus>(50)
    this.trees = this.createPool<EntityStatus>(30)
    this.candles = this.createPool<CandleState>(20)
    this.skeletons = this.createPool<EntityStatus>(50)
    this.ghosts = this.createPool<EntityStatus>(20)
  }

  public static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager()
    }
    return EntityManager.instance
  }

  private createPool<T>(maxSize: number): EntityPool<T> {
    return {
      entities: [],
      active: new Set<Entity>(),
      inactive: new Set<Entity>(),
      maxSize
    }
  }

  /**
   * Get an available entity from the pool
   */
  public getEntity<T>(pool: EntityPool<T>): T | null {
    if (pool.entities.length >= pool.maxSize) {
      console.log(`Pool at maximum capacity: ${pool.maxSize}`)
      return null
    }

    // Find an unused entity
    for (const entity of pool.entities) {
      if (this.isEntityUnused(entity)) {
        this.markEntityAsUsed(entity)
        return entity
      }
    }

    return null
  }

  /**
   * Return an entity to the pool
   */
  public returnEntity<T>(pool: EntityPool<T>, entity: T): void {
    if (this.isEntityUnused(entity)) {
      this.markEntityAsUnused(entity)
    }
  }

  /**
   * Check if entity is unused (generic implementation)
   */
  private isEntityUnused(entity: any): boolean {
    if (entity && typeof entity === 'object') {
      if ('used' in entity) {
        return !entity.used
      }
      if ('active' in entity) {
        return !entity.active
      }
    }
    return false
  }

  /**
   * Mark entity as used
   */
  private markEntityAsUsed(entity: any): void {
    if (entity && typeof entity === 'object') {
      if ('used' in entity) {
        entity.used = true
      }
      if ('active' in entity) {
        entity.active = true
      }
    }
  }

  /**
   * Mark entity as unused
   */
  private markEntityAsUnused(entity: any): void {
    if (entity && typeof entity === 'object') {
      if ('used' in entity) {
        entity.used = false
      }
      if ('active' in entity) {
        entity.active = false
      }
    }
  }

  /**
   * Clean up all entities in a pool
   */
  public cleanupPool<T>(pool: EntityPool<T>): void {
    for (const entity of pool.entities) {
      if (this.isEntityActive(entity)) {
        this.destroyEntity(entity)
      }
    }
    pool.entities.length = 0
    pool.active.clear()
    pool.inactive.clear()
  }

  /**
   * Check if entity is active
   */
  private isEntityActive(entity: any): boolean {
    if (entity && typeof entity === 'object') {
      if ('used' in entity) {
        return entity.used
      }
      if ('active' in entity) {
        return entity.active
      }
    }
    return false
  }

  /**
   * Destroy an entity safely
   */
  private destroyEntity(entity: any): void {
    try {
      if (entity && entity.entity && typeof entity.entity === 'object') {
        engine.removeEntity(entity.entity)
      }
    } catch (error) {
      console.log('Failed to destroy entity:', error)
    }
  }

  /**
   * Clean up all pools
   */
  public cleanup(): void {
    this.cleanupPool(this.walls)
    this.cleanupPool(this.floors)
    this.cleanupPool(this.pillars)
    this.cleanupPool(this.trees)
    this.cleanupPool(this.candles)
    this.cleanupPool(this.skeletons)
    this.cleanupPool(this.ghosts)
  }

  /**
   * Get pool statistics
   */
  public getStats(): Record<string, { total: number; active: number; inactive: number }> {
    return {
      walls: {
        total: this.walls.entities.length,
        active: this.walls.active.size,
        inactive: this.walls.inactive.size
      },
      floors: {
        total: this.floors.entities.length,
        active: this.floors.active.size,
        inactive: this.floors.inactive.size
      },
      pillars: {
        total: this.pillars.entities.length,
        active: this.pillars.active.size,
        inactive: this.pillars.inactive.size
      },
      trees: {
        total: this.trees.entities.length,
        active: this.trees.active.size,
        inactive: this.trees.inactive.size
      },
      candles: {
        total: this.candles.entities.length,
        active: this.candles.active.size,
        inactive: this.candles.inactive.size
      },
      skeletons: {
        total: this.skeletons.entities.length,
        active: this.skeletons.active.size,
        inactive: this.skeletons.inactive.size
      },
      ghosts: {
        total: this.ghosts.entities.length,
        active: this.ghosts.active.size,
        inactive: this.ghosts.inactive.size
      }
    }
  }
}
