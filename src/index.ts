import { executeTask } from '@dcl/sdk/ecs'
import { GameManager } from './core/GameManager'
import { setupUi } from './ui'
import { addFog, addHideOtherAvatarArea, setLight } from './landscape'
import { playRandomAmbienceLoop } from './ambience'
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
      addHideOtherAvatarArea(userData)
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