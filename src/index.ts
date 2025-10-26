import { engine, executeTask } from '@dcl/sdk/ecs'
import { GameManager } from './core/GameManager'
import { fadeTransition, setupUi } from './ui'
import { addFog, setLight } from './landscape'
import { playRandomAmbienceLoop } from './ambience'
import { createStage5Scene } from './stage5'
import { getUserData, GetUserDataResponse } from '~system/UserIdentity'

// Initialize game manager
const gameManager = GameManager.getInstance()
export let userData : GetUserDataResponse|undefined
export function main() {

  
  
  executeTask(async () => {
    userData = await getUserData({})

    
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
        
        console.log('Fever Dream experience initialized successfully')
      }).catch((error) => {
        console.error('Failed to initialize game:', error)
      })
      
    } catch (error) {
      console.error('Failed to start main function:', error)
    }

  })

  
}