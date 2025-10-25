import { engine } from '@dcl/sdk/ecs'
import { GameManager } from './core/GameManager'
import { setupUi } from './ui'
import { addFog, setLight } from './landscape'
import { playRandomAmbienceLoop } from './ambience'

// Initialize game manager
const gameManager = GameManager.getInstance()

export function main() {
  console.log('Initializing Fever Dream experience...')
  
  try {
    // Initialize core systems
    setupUi()
    setLight()
    addFog()
    playRandomAmbienceLoop()
    
    // Initialize game manager
    gameManager.initialize().then(() => {
      // Start the game
      gameManager.startGame()
      
      // Set up game update system
      engine.addSystem((dt: number) => {
        gameManager.update(dt)
      })
      
      console.log('Fever Dream experience initialized successfully')
    }).catch((error) => {
      console.error('Failed to initialize game:', error)
    })
    
  } catch (error) {
    console.error('Failed to start main function:', error)
  }
}