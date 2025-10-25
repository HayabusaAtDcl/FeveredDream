import { Entity } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

// ============================================================================
// CORE TYPES
// ============================================================================

export interface EntityStatus {
  used: boolean
  entity: Entity
}

export interface CandleState {
  entity: Entity
  timer: number
  active: boolean
}

export interface GameState {
  gameStarted: boolean
  gameOver: boolean
  activateAngels: boolean
  currentStage: StageType
}

export type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4'

// ============================================================================
// STAGE TYPES
// ============================================================================

export interface StageConfig {
  cellSize: number
  cols: number
  rows: number
  wallThickness: number
  wallLength: number
  wallHeight: number
  floorLength: number
  showRange: number
}

export interface Cell {
  x: number
  y: number
  visited: boolean
  grid: Cell[]
  stage: Stage
  reveal: number
  type: number
  walls: boolean[]
  wall_ents: EntityStatus[]
  floor_ents: EntityStatus[]
  ceiling_ents: EntityStatus[]
  lighting_ents: EntityStatus[]
  pillar_ents: EntityStatus[]
  tree_ents: EntityStatus[]
}

export interface Stage {
  cellSize: number
  grid: Cell[]
  cols: number
  rows: number
  wall_thickness: number
  wall_length: number
  wall_height: number
  current: Cell | null
  stack: Cell[]
  floor_length: number
  randomseed: number
  prev_parcel_x: number | null
  prev_parcel_z: number | null
  walls: EntityStatus[]
  floors: EntityStatus[]
  ceilings: EntityStatus[]
  lightings: EntityStatus[]
  pillars: EntityStatus[]
  trees: EntityStatus[]
  active_angels: EntityStatus[]
  show_range: number
  parcel_rendered: number
  gravestones: Entity[]
}

// ============================================================================
// AUDIO TYPES
// ============================================================================

export interface AudioConfig {
  volume: number
  loop: boolean
  playing: boolean
  global: boolean
}

export interface AudioEntity {
  entity: Entity
  config: AudioConfig
}

export interface AudioManager {
  ambience: AudioEntity[]
  effects: AudioEntity[]
  music: AudioEntity[]
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface UIState {
  showEndUI: boolean
  endUIOpacity: number
  showStartUI: boolean
  showFade: boolean
  fadeOpacity: number
}

export interface FadeTransition {
  onTransition: () => void
  duration: number
  callback?: () => void
}

// ============================================================================
// ENTITY MANAGEMENT TYPES
// ============================================================================

export interface EntityPool<T> {
  entities: T[]
  active: Set<Entity>
  inactive: Set<Entity>
  maxSize: number
}

export interface EntityManager {
  walls: EntityPool<EntityStatus>
  floors: EntityPool<EntityStatus>
  pillars: EntityPool<EntityStatus>
  trees: EntityPool<EntityStatus>
  candles: EntityPool<CandleState>
  skeletons: EntityPool<EntityStatus>
  ghosts: EntityPool<EntityStatus>
}

// ============================================================================
// SYSTEM TYPES
// ============================================================================

export interface SystemConfig {
  enabled: boolean
  updateRate: number
  lastUpdate: number
}

export interface GameSystem {
  name: string
  config: SystemConfig
  update: (dt: number) => void
  cleanup: () => void
}

// ============================================================================
// LIGHTING TYPES
// ============================================================================

export interface LightConfig {
  type: 'point' | 'spot' | 'directional'
  color: Vector3
  intensity: number
  active: boolean
  position: Vector3
  rotation?: Quaternion
}

export interface LightingManager {
  fogLight: Entity
  portalLight: Entity
  stageLights: Entity[]
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export interface AnimationState {
  clip: string
  playing: boolean
  loop: boolean
  weight?: number
}

export interface AnimationManager {
  entities: Map<Entity, AnimationState[]>
  update: (dt: number) => void
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  frameRate: number
  entityCount: number
  systemCount: number
  memoryUsage: number
}

export interface PerformanceMonitor {
  metrics: PerformanceMetrics
  update: () => void
  log: () => void
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface ErrorHandler {
  log: (error: Error, context: string) => void
  recover: (error: Error, context: string) => boolean
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface GameConfig {
  maxActiveCandles: number
  candleDuration: number
  angelActivationDelay: number
  fogRotationSpeed: number
  performance: {
    maxEntities: number
    updateRate: number
    cleanupInterval: number
  }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface GameEvent {
  type: string
  data: any
  timestamp: number
}

export interface EventManager {
  listeners: Map<string, ((event: GameEvent) => void)[]>
  emit: (event: GameEvent) => void
  subscribe: (type: string, callback: (event: GameEvent) => void) => void
  unsubscribe: (type: string, callback: (event: GameEvent) => void) => void
}
