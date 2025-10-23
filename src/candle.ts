import {
  engine,
  Entity,
  Transform,
  pointerEventsSystem,
  InputAction,
  GltfContainer,
  Animator
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { isGameStarted } from './ui'
export let gameOver: boolean = false;

export function setGameOver(){
    gameOver = true
}
// 🔥 Candle config
const MAX_ACTIVE_CANDLES = 5
const CANDLE_DURATION = 60  // seconds per candle

// 🕯️ Candle data
type CandleState = {
  entity: Entity
  timer: number
  active: boolean
}


const candles: CandleState[] = []

// 👁️ Global flag (shared across modules)
export let activateAngels = false

// ----------------------------
// CREATE CANDLE
// ----------------------------
export function createCandle(position: Vector3) {
  gameOver = false;
  activateAngels = false;

  const candle = engine.addEntity()

  Transform.createOrReplace(candle, {
    position,
    scale: Vector3.create(0.3, .3, 0.3)
  })

  GltfContainer.createOrReplace(candle, {
              src: "models/candle.glb",
             //visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
              //invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
          })

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
        },
      ]
    })

  candles.push({ entity: candle, timer: 0, active: false })

  // Pointer interaction
  pointerEventsSystem.onPointerDown(
    {
      entity: candle,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Light Candle' }
    },
    () => {
      const activeCount = candles.filter(c => c.active).length
      if (activeCount >= MAX_ACTIVE_CANDLES) {
        console.log('🔥 You already have 3 candles lit!')
        return
      }

      const state = candles.find(c => c.entity === candle)
      if (state && !state.active) {
        lightCandle(state)
      }
    }
  )

  return candle
}

// ----------------------------
// SYSTEM
// ----------------------------
export function candleSystem() {
  return (dt: number) => {

    if (gameOver) return
    
    // Don't run candle system until game starts
    if (!isGameStarted()) return

    for (const c of candles) {
      if (c.active) {
        c.timer -= dt
        if (c.timer <= 0) {
          extinguishCandle(c)
        }
      }
    }

    // 👇 Update flag depending on whether any candles are active
    const anyActive = candles.some(c => c.active)
    activateAngels = !anyActive

    if (activateAngels) {
      console.log('😈 All candles out — activate angels!')
    }
  }
}

// ----------------------------
// HELPERS
// ----------------------------
function lightCandle(c: CandleState) {
  c.active = true
  c.timer = CANDLE_DURATION
  
  Animator.getClip(c.entity, 'Extinguish').playing= false
  Animator.getClip(c.entity, 'Flame').playing= true

  utils.timers.setTimeout(() => {
     Animator.getClip(c.entity, 'FlameIdle').playing= true
  }, 500)
  console.log(`🕯️ Candle lit for ${CANDLE_DURATION}s.`)
}

function extinguishCandle(c: CandleState) {
  c.active = false
  c.timer = 0
  
  Animator.getClip(c.entity, 'Flame').playing= false
  Animator.getClip(c.entity, 'FlameIdle').playing= false
  
  Animator.getClip(c.entity, 'Extinguish').playing= true
  console.log('💨 Candle expired and reappeared.')
}


export function forceLightCandle(entity: Entity) {
  const candle = candles.find(c => c.entity === entity)
  if (candle && !candle.active) {
    lightCandle(candle)
  }
}
