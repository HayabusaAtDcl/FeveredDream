import {
  engine,
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity, Button } from '@dcl/sdk/react-ecs'

// Global state for UI
let showEndUI = false
let endUIOpacity = 0
let showStartUI = true
let gameStarted = false

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

// Function to trigger the end UI
export function showEndScreen() {
  console.log("Showing end screen...")
  showEndUI = true
  
  // Gradually fade in the UI
  const fadeSystem = (dt: number) => {
    if (showEndUI && endUIOpacity < 1) {
      endUIOpacity += dt * 0.5 // Fade in over 2 seconds
      if (endUIOpacity >= 1) {
        endUIOpacity = 1
        engine.removeSystem(fadeSystem)
      }
    }
  }
  
  engine.addSystem(fadeSystem)
}

// Function to hide the end UI
export function hideEndScreen() {
  showEndUI = false
  endUIOpacity = 0
}

// Function to close the start UI
export function closeStartScreen() {
  showStartUI = false
  gameStarted = true
}

// Function to check if game has started
export function isGameStarted() {
  return gameStarted
}

const uiComponent = () => (
  <UiEntity
    uiTransform={{
      width: '100%',
      height: '100%'
    }}
  >
    {/* Start Screen */}
    {showStartUI && (
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
              height: 400,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20
            }}
            uiBackground={{ 
              color: Color4.create(0.1, 0.1, 0.1, 0.9) // Dark background
            }}
          >
            <Label
              value="FEVERED DREAM"
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
                height: 200,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Label
                value="Welcome to the Fevered Dream experience."
                fontSize={18}
                color={Color4.create(1, 1, 1, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 30,
                  margin: '10px 0'
                }}
              />
              <Label
                value="Your journey begins in a mysterious graveyard where"
                fontSize={16}
                color={Color4.create(0.9, 0.9, 0.9, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 25,
                  margin: '5px 0'
                }}
              />
              <Label
                value="the weeping angels guard the darkness. Light candles to"
                fontSize={16}
                color={Color4.create(0.9, 0.9, 0.9, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 25,
                  margin: '5px 0'
                }}
              />
              <Label
                value="keep the angels at bay, but when the light"
                fontSize={16}
                color={Color4.create(0.9, 0.9, 0.9, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 25,
                  margin: '5px 0'
                }}
              />
              <Label
                value="fades, they will hunt you down. But no fear.  Your journey will"
                fontSize={16}
                color={Color4.create(0.9, 0.9, 0.9, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 25,
                  margin: '5px 0'
                }}
              />
              <Label
                value="take you through three different areas. Just explore and"
                fontSize={16}
                color={Color4.create(0.9, 0.9, 0.9, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 25,
                  margin: '5px 0'
                }}
              />
              <Label
                value="see if you can reach all three."
                fontSize={16}
                color={Color4.create(0.9, 0.9, 0.9, 1)}
                uiTransform={{ 
                  width: '100%', 
                  height: 25,
                  margin: '5px 0'
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
              onMouseDown={() => {
                closeStartScreen()
              }}
            />
          </UiEntity>
        </UiEntity>
      </UiEntity>
    )}

    {/* End Screen Overlay */}
    {showEndUI && (
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
            value="Thank you for playing!"
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
    )}
  </UiEntity>
)
