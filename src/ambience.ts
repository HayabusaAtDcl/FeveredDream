import { engine, AudioSource, Entity } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils' 
import { amb1, amb2, amb3, amb4, generateRandomNumber } from './utils'
// list of ambience sounds
const ambSounds = [amb1, amb2, amb3, amb4]

export let killAmbienceFlag = false
export function killAmbience(){
  killAmbienceFlag = true;
}
// helper to stop all
function stopAll() {
  for (const amb of ambSounds) {
    AudioSource.getMutable(amb).playing = false
  }
}

// play random and recurse
export async function playRandomAmbienceLoop() {
  // stop any currently playing
  stopAll()

  // pick random
  const randomIndex = Math.floor(Math.random() * ambSounds.length)
  const chosen = ambSounds[randomIndex]
  const audio = AudioSource.getMutable(chosen)

  // play it
  audio.playing = true
  audio.loop = false
  console.log(`🎵 Playing ambience ${randomIndex + 1}`)

  // fake duration — since AudioSource doesn’t expose clip length
  // adjust this based on your clip lengths (e.g., 10–20 seconds)
  const clipDuration = 10 + Math.random() * 10

  // wait for clip duration + random gap
  const gap = 3 + Math.random() * 5


  utils.timers.setTimeout(()=> {

    if(killAmbienceFlag) return;
  // recurse to play next one
   playRandomAmbienceLoop()
  },  (clipDuration + gap) * 1000)


}

