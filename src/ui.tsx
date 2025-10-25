import { engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import * as utils from '@dcl-sdk/utils'
import { StartScreen, EndScreen, FadeTransition, LoadingScreen } from './ui/components/UIComponents'
import { GameManager } from './core/GameManager'

// Global state for UI
let showEndUI = false
let endUIOpacity = 0
let showStartUI = true
let gameStarted = false

// Fade transition state
let showFade = false
let fadeOpacity = 0


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

// Function to fade out, execute callback, then fade in
export function fadeTransition(onTransition: () => void): Promise<void> {
  return new Promise((resolve) => {
    console.log("Starting fade transition...")
    showFade = true
    fadeOpacity = 0
    
    // Fade out (to black) - slower fade
    const fadeOutSystem = (dt: number) => {
      fadeOpacity += dt * 1 // Fade out over 1 second (slower)
      if (fadeOpacity >= 1) {
        fadeOpacity = 1
        engine.removeSystem(fadeOutSystem)
        
        console.log("Fade to black complete, executing transition...")
        // Execute the transition callback
        onTransition()
        
        // Wait longer for assets to load, then fade back in
        utils.timers.setTimeout(() => {
          const fadeInSystem = (dt: number) => {
            fadeOpacity -= dt * 0.5 // Fade in over 2 seconds (even slower)
            if (fadeOpacity <= 0) {
              fadeOpacity = 0
              showFade = false
              engine.removeSystem(fadeInSystem)
              console.log("Fade transition complete")
              resolve()
            }
          }
          engine.addSystem(fadeInSystem)
        }, 4000) // Hold black screen for 2 seconds to let assets load
      }
    }
    engine.addSystem(fadeOutSystem)
  })
}

const uiComponent = () => {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%'
      }}
    >
      {/* Start Screen */}
      <StartScreen 
        showStartUI={showStartUI} 
        onStart={closeStartScreen} 
      />

      {/* Fade Transition Overlay */}
      <FadeTransition 
        showFade={showFade} 
        fadeOpacity={fadeOpacity} 
      />

      {/* End Screen Overlay */}
      <EndScreen 
        showEndUI={showEndUI} 
        endUIOpacity={endUIOpacity} 
      />

    </UiEntity>
  )
}
