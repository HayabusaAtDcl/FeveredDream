import { engine, AudioSource, Transform, Entity } from '@dcl/sdk/ecs'
import { AudioEntity, AudioManager as IAudioManager, AudioConfig } from '../types'

/**
 * Centralized Audio Management System
 * Handles audio loading, playback, and resource management
 */
export class AudioManager implements IAudioManager {
  public ambience: AudioEntity[] = []
  public effects: AudioEntity[] = []
  public music: AudioEntity[] = []

  private static instance: AudioManager | null = null
  private audioCache: Map<string, AudioEntity> = new Map()
  private isInitialized: boolean = false

  constructor() {
    this.initializeAudioEntities()
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  /**
   * Initialize all audio entities
   */
  private initializeAudioEntities(): void {
    if (this.isInitialized) return

    // Ambience sounds
    this.ambience = [
      this.createAudioEntity('sounds/ambience1.mp3', { volume: 0.8, loop: false, playing: false, global: true }),
      this.createAudioEntity('sounds/ambience2.mp3', { volume: 0.8, loop: false, playing: false, global: true }),
      this.createAudioEntity('sounds/ambience3.mp3', { volume: 0.8, loop: false, playing: false, global: true }),
      this.createAudioEntity('sounds/ambience4.mp3', { volume: 0.8, loop: false, playing: false, global: true })
    ]

    // Effect sounds
    this.effects = [
      this.createAudioEntity('sounds/creaky.mp3', { volume: 0.8, loop: true, playing: false, global: true }),
      this.createAudioEntity('sounds/whisper.mp3', { volume: 0.8, loop: true, playing: false, global: true }),
      this.createAudioEntity('sounds/angry.mp3', { volume: 1.0, loop: true, playing: false, global: true })
    ]

    // Music sounds
    this.music = [
      this.createAudioEntity('sounds/heart.mp3', { volume: 0.8, loop: true, playing: true, global: true }),
      this.createAudioEntity('sounds/wind.mp3', { volume: 0.8, loop: true, playing: true, global: true }),
      this.createAudioEntity('sounds/dungeon.mp3', { volume: 1.0, loop: true, playing: false, global: true }),
      this.createAudioEntity('sounds/final.mp3', { volume: 1.0, loop: true, playing: false, global: true })
    ]

    this.isInitialized = true
    console.log('AudioManager initialized with', this.getTotalAudioCount(), 'audio entities')
  }

  /**
   * Create an audio entity with configuration
   */
  private createAudioEntity(url: string, config: AudioConfig): AudioEntity {
    const entity = engine.addEntity()
    Transform.create(entity)
    
    AudioSource.create(entity, {
      audioClipUrl: url,
      playing: config.playing,
      loop: config.loop,
      global: config.global,
      volume: config.volume
    })

    const audioEntity: AudioEntity = {
      entity,
      config
    }

    this.audioCache.set(url, audioEntity)
    return audioEntity
  }

  /**
   * Play a specific audio by URL
   */
  public playAudio(url: string, config?: Partial<AudioConfig>): boolean {
    const audioEntity = this.audioCache.get(url)
    if (!audioEntity) {
      console.log(`Audio not found: ${url}`)
      return false
    }

    const audioSource = AudioSource.getMutable(audioEntity.entity)
    audioSource.playing = true

    if (config) {
      if (config.volume !== undefined) {
        audioSource.volume = config.volume
      }
      if (config.loop !== undefined) {
        audioSource.loop = config.loop
      }
    }

    return true
  }

  /**
   * Stop a specific audio by URL
   */
  public stopAudio(url: string): boolean {
    const audioEntity = this.audioCache.get(url)
    if (!audioEntity) {
      console.log(`Audio not found: ${url}`)
      return false
    }

    const audioSource = AudioSource.getMutable(audioEntity.entity)
    audioSource.playing = false
    return true
  }

  /**
   * Stop all audio in a category
   */
  public stopAllInCategory(category: 'ambience' | 'effects' | 'music'): void {
    const audioList = this[category]
    for (const audioEntity of audioList) {
      const audioSource = AudioSource.getMutable(audioEntity.entity)
      audioSource.playing = false
    }
  }

  /**
   * Stop all audio
   */
  public stopAll(): void {
    this.stopAllInCategory('ambience')
    this.stopAllInCategory('effects')
    this.stopAllInCategory('music')
  }

  /**
   * Set volume for a specific audio
   */
  public setVolume(url: string, volume: number): boolean {
    const audioEntity = this.audioCache.get(url)
    if (!audioEntity) {
      console.log(`Audio not found: ${url}`)
      return false
    }

    const audioSource = AudioSource.getMutable(audioEntity.entity)
    audioSource.volume = Math.max(0, Math.min(1, volume))
    return true
  }

  /**
   * Set volume for all audio in a category
   */
  public setCategoryVolume(category: 'ambience' | 'effects' | 'music', volume: number): void {
    const audioList = this[category]
    for (const audioEntity of audioList) {
      const audioSource = AudioSource.getMutable(audioEntity.entity)
      audioSource.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Check if audio is playing
   */
  public isPlaying(url: string): boolean {
    const audioEntity = this.audioCache.get(url)
    if (!audioEntity) return false

    const audioSource = AudioSource.get(audioEntity.entity)
    return audioSource.playing || false
  }

  /**
   * Get audio entity by URL
   */
  public getAudioEntity(url: string): AudioEntity | undefined {
    return this.audioCache.get(url)
  }

  /**
   * Get total audio count
   */
  public getTotalAudioCount(): number {
    return this.ambience.length + this.effects.length + this.music.length
  }

  /**
   * Get playing audio count
   */
  public getPlayingCount(): number {
    let count = 0
    const allAudioEntities = [...this.ambience, ...this.effects, ...this.music]
    
    for (const audioEntity of allAudioEntities) {
        try {
            if (AudioSource.get(audioEntity.entity).playing) {
                count++
            }
        } catch (error) {
            // Entity might have been removed
            console.log('Audio entity not found during count:', error)
        }
    }
    return count
}

  /**
   * Clean up all audio entities
   */
  public cleanup(): void {
    // Collect all entities to remove first
    const entitiesToRemove: Entity[] = []
    
    for (const audioEntity of [...this.ambience, ...this.effects, ...this.music]) {
        entitiesToRemove.push(audioEntity.entity)
    }
    
    // Now remove all entities
    for (const entity of entitiesToRemove) {
        try {
            engine.removeEntity(entity)
        } catch (error) {
            console.log('Failed to remove audio entity:', error)
        }
    }

    this.ambience.length = 0
    this.effects.length = 0
    this.music.length = 0
    this.audioCache.clear()
    this.isInitialized = false

    console.log('AudioManager cleaned up')
}

  /**
   * Get audio statistics
   */
  public getStats(): {
    total: number
    playing: number
    ambience: number
    effects: number
    music: number
  } {
    return {
      total: this.getTotalAudioCount(),
      playing: this.getPlayingCount(),
      ambience: this.ambience.length,
      effects: this.effects.length,
      music: this.music.length
    }
  }
}
