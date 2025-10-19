import { engine, Transform, AudioSource } from "@dcl/sdk/ecs"

export const amb1 = engine.addEntity()
Transform.create(amb1)
AudioSource.create(amb1, { audioClipUrl: 'sounds/ambience1.mp3',  playing: false, loop: false, global: true, volume: 0.8 })

export const amb2 = engine.addEntity()
Transform.create(amb2)
AudioSource.create(amb2, { audioClipUrl: 'sounds/ambience2.mp3',  playing: false, loop: false, global: true, volume: 0.8 })

export const amb3 = engine.addEntity()
Transform.create(amb3)
AudioSource.create(amb3, { audioClipUrl: 'sounds/ambience3.mp3',  playing: false, loop: false, global: true , volume: 0.8})

export const amb4 = engine.addEntity()
Transform.create(amb4)
AudioSource.create(amb4, { audioClipUrl: 'sounds/ambience4.mp3',  playing: false, loop: false, global: true, volume: 0.8 })

export const creaky = engine.addEntity()
Transform.create(creaky)
AudioSource.create(creaky, { audioClipUrl: 'sounds/creaky.mp3',  playing: false, loop: true , global: true, volume: 0.8})

export const heart = engine.addEntity()
Transform.create(heart)
AudioSource.create(heart, { audioClipUrl: 'sounds/heart.mp3',  playing: true, loop: true, global: true, volume: 0.8 })

export const  wind= engine.addEntity()
Transform.create(wind)
AudioSource.create(wind, { audioClipUrl: 'sounds/wind.mp3',  playing: true, loop: true, global: true, volume: 0.8 })

export const  whisper = engine.addEntity()
Transform.create(whisper)
AudioSource.create(whisper, { audioClipUrl: 'sounds/whisper.mp3',  playing: true, loop: true, global: true, volume: 0.8 })


export const  angry = engine.addEntity()
Transform.create(angry)
AudioSource.create(angry, { audioClipUrl: 'sounds/angry.mp3',  playing: false, loop: true, global: true, volume: 1 })



export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}