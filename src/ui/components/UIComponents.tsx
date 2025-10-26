import ReactEcs, { Label, Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UIState } from '../../types'

/**
 * Reusable UI Components
 * Centralized UI components for better maintainability
 */

// ============================================================================
// START SCREEN COMPONENT
// ============================================================================

export interface StartScreenProps {
  showStartUI: boolean
  onStart: () => void
}

export const StartScreen = ({ showStartUI, onStart }: StartScreenProps) => {
  if (!showStartUI) return null

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        position: { top: 0, left: 0 }
      }}
      uiBackground={{ 
        color: Color4.create(0, 0, 0, 0.8) // Semi-transparent black
      }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <UiEntity
          uiTransform={{
            width: 600,
            height: 480, // Increased from 400 to 480
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20
          }}
          uiBackground={{ 
            color: Color4.create(0.1, 0.1, 0.1, 0.9)
          }}
        >
          <Label
            value="FEVER DREAM"
            fontSize={36}
            color={Color4.create(1, 1, 1, 1)}
            uiTransform={{ 
              width: '100%', 
              height: 50,
              margin: '20px 0'
            }}
          />
          
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 280, // Increased from 200 to 280 to accommodate more text
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Label
              value="Welcome to the Fever Dream experience. "
              fontSize={18}
              color={Color4.create(1, 1, 1, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 30,
                margin: '8px 0' // Reduced margin slightly
              }}
            />

          <Label
              value="Please keep UI on for better immersion and transitioning."
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 32, // Reduced height slightly
                margin: '4px 0' // Reduced margin
              }}
            />

            <Label
              value="Your journey begins in a mysterious graveyard where"
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22, // Reduced height slightly
                margin: '4px 0' // Reduced margin
              }}
            />
            <Label
              value="the weeping angels guard the darkness. The lit candle"
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22,
                margin: '4px 0'
              }}
            />
            <Label
              value="keeps the angels at bay, but when the light"
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22,
                margin: '4px 0'
              }}
            />
            <Label
              value="fades, they will hunt you down."
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22,
                margin: '4px 0'
              }}
            />

          <Label
              value="Have no fear. Journey through"
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22,
                margin: '4px 0'
              }}
            />          

            <Label
              value="until you reach the end (It will say so!)"
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22,
                margin: '4px 0'
              }}
            />          

          <Label
              value="When in doubt just light the candles."
              fontSize={16}
              color={Color4.create(0.9, 0.9, 0.9, 1)}
              uiTransform={{ 
                width: '100%', 
                height: 22,
                margin: '4px 0'
              }}
            />
          </UiEntity>
          
          <Button
            value="BEGIN JOURNEY"
            fontSize={18}
            variant="primary"
            uiTransform={{ 
              width: 200, 
              height: 50,
              margin: '20px 0'
            }}
            onMouseDown={onStart}
          />
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}

// ============================================================================
// END SCREEN COMPONENT
// ============================================================================

export interface EndScreenProps {
  showEndUI: boolean
  endUIOpacity: number
}

export const EndScreen = ({ showEndUI, endUIOpacity }: EndScreenProps) => {
  if (!showEndUI) return null

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        position: { top: 0, left: 0 }
      }}
      uiBackground={{ 
        color: Color4.create(0, 0, 0, endUIOpacity * 0.9) // Black with fade
      }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Label
          value="THE END"
          fontSize={48}
          color={Color4.create(1, 1, 1, endUIOpacity)} // White text
          uiTransform={{ 
            width: '100%', 
            height: 60,
            margin: '20px 0'
          }}
        />
        <Label
          value="Thank you for visiting!"
          fontSize={24}
          color={Color4.create(1, 1, 1, endUIOpacity)}
          uiTransform={{ 
            width: '100%', 
            height: 40,
            margin: '10px 0'
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

// ============================================================================
// FADE TRANSITION COMPONENT
// ============================================================================

export interface FadeTransitionProps {
  showFade: boolean
  fadeOpacity: number
}

export const FadeTransition = ({ showFade, fadeOpacity }: FadeTransitionProps) => {
  if (!showFade) return null

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        display: 'flex'
      }}
      uiBackground={{ 
        color: Color4.create(0, 0, 0, fadeOpacity) // Full black fade
      }}
    />
  )
}

// ============================================================================
// PERFORMANCE OVERLAY COMPONENT
// ============================================================================

export interface PerformanceOverlayProps {
  show: boolean
  frameRate: number
  entityCount: number
  performanceScore: number
}

export const PerformanceOverlay = ({ 
  show, 
  frameRate, 
  entityCount, 
  performanceScore 
}: PerformanceOverlayProps) => {
  if (!show) return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return Color4.create(0, 1, 0, 1) // Green
    if (score >= 60) return Color4.create(1, 1, 0, 1) // Yellow
    return Color4.create(1, 0, 0, 1) // Red
  }

  return (
    <UiEntity
      uiTransform={{
        width: 200,
        height: 100,
        positionType: 'absolute',
        position: { top: 10, right: 10 }
      }}
      uiBackground={{ 
        color: Color4.create(0, 0, 0, 0.7)
      }}
    >
      <Label
        value={`FPS: ${frameRate}`}
        fontSize={14}
        color={Color4.create(1, 1, 1, 1)}
        uiTransform={{ 
          width: '100%', 
          height: 20,
          margin: '5px 0'
        }}
      />
      <Label
        value={`Entities: ${entityCount}`}
        fontSize={14}
        color={Color4.create(1, 1, 1, 1)}
        uiTransform={{ 
          width: '100%', 
          height: 20,
          margin: '5px 0'
        }}
      />
      <Label
        value={`Score: ${performanceScore}`}
        fontSize={14}
        color={getScoreColor(performanceScore)}
        uiTransform={{ 
          width: '100%', 
          height: 20,
          margin: '5px 0'
        }}
      />
    </UiEntity>
  )
}

// ============================================================================
// LOADING SCREEN COMPONENT
// ============================================================================

export interface LoadingScreenProps {
  show: boolean
  message: string
}

export const LoadingScreen = ({ show, message }: LoadingScreenProps) => {
  if (!show) return null

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        position: { top: 0, left: 0 }
      }}
      uiBackground={{ 
        color: Color4.create(0, 0, 0, 0.9)
      }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Label
          value={message}
          fontSize={24}
          color={Color4.create(1, 1, 1, 1)}
          uiTransform={{ 
            width: '100%', 
            height: 40,
            margin: '20px 0'
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}
