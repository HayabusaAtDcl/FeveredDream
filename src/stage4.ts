import { engine, Entity, GltfContainer, Transform, ColliderLayer, Animator, pointerEventsSystem, InputAction, LightSource, AudioSource, Material, MeshRenderer, Billboard, PBBillboard, BillboardMode } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math";
import { movePlayerTo } from "~system/RestrictedActions";
import * as utils from '@dcl-sdk/utils'
import { angry, creaky, dungeon, final, heart, whisper, wind } from "./utils";
import { fadeOut, fadeTransition, showEndScreen } from './ui';
import { darkness_sphere, foglight, fogRotationSystem, portalLight, shrinkFog } from "./landscape";
import { killAmbience } from "./ambience";


let rock: Entity | null = null
let skullPile: Entity | null = null
let dozey: Entity| null = null
let skeletons: Entity[] = []
let candles: Entity[] = []
let sign: Entity | null = null

let fireGroundTiles: Entity[] = []
export function createStage4Scene() {
    console.log("Creating stage4 scene...")
    addSounds()
    // Shrink fog back to normal size for stage4
    shrinkFog()
    
    // Create rock as the base
    rock = engine.addEntity()
    GltfContainer.createOrReplace(rock, {
        src: 'models/rock.glb',
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
    
    Transform.createOrReplace(rock, {
        position: Vector3.create(0, 1, 0), // Center of the scene
        scale: Vector3.create(15, 15, 15),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    
    // Create skull pile using the GLB model
    skullPile = engine.addEntity()
    GltfContainer.createOrReplace(skullPile, {
        src: 'models/pileskulls.glb',
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
    
    Transform.createOrReplace(skullPile, {
        position: Vector3.create(-.5, -0.02, 0), // On top of the rock
        scale: Vector3.create(.2,.2,.2), // Larger scale
        rotation: Quaternion.fromEulerDegrees(0, 0, 0),
        parent: rock
    })


    // Add sign.glb between candle and dozey
    sign = engine.addEntity()
    GltfContainer.createOrReplace(sign, {
        src: 'models/sign.glb',
         visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
    
    Transform.createOrReplace(sign, {
        position: Vector3.create(-.7, -0.02, 0), // Between ground and dozey
        scale: Vector3.create(.1, .1, .1), // Scale as needed
        rotation: Quaternion.fromEulerDegrees(-10, 10, 0),
        parent: rock
    })

    // Add dozey.glb on top of the skull pile
    dozey = engine.addEntity()
    GltfContainer.createOrReplace(dozey, {
        src: 'models/dozey.glb',
         visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })

    Animator.create(dozey, {
        states: [
            {
                clip: "Dozing_Elderly",
                playing: true,
                loop: true
            },
            {
                clip: "Angry_To_Tantrum_Sit",
                playing: false,
                loop: true
            },
            {
                clip: "Angry_Ground_Stomp",
                playing: false,
                loop: true
            },
            {
                clip: "Zombie_Scream",
                playing: false,
                loop: true
            }
        ]
    })
    Animator.getClip(dozey, "Dozing_Elderly").playing = true
    
    Transform.createOrReplace(dozey, {
        position: Vector3.create(.2, -0.2, 0.2), // Higher up on the skull pile
        scale: Vector3.create(1.1, 1.1, 1.1), // Larger scale
        rotation: Quaternion.fromEulerDegrees(0, 0, 0),
        parent: skullPile
    })
    
    // Create 20 skeletons just outside the darkness sphere
    const darknessRadius = 10.5 // Same as darkness sphere radius
    
    for (let i = 0; i < 20; i++) {
        const skeleton = engine.addEntity()
        GltfContainer.createOrReplace(skeleton, {
            src: 'models/skeleton.glb'
        })

        Animator.create(skeleton, {
            states: [
                {
                    clip: "Swim_Forward",
                    playing: true,
                    loop: true
                }
            ]
        })
        Animator.getClip(skeleton, "Swim_Forward").playing = true
        
        // Position skeletons in a circle just outside the darkness sphere
        const angle = (i / 20) * Math.PI * 2
        const distance = darknessRadius + 5 + Math.random() * 10 // 5-15 units outside the sphere
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance
        const y = Math.random() * 2 // Slight height variation
        
        Transform.createOrReplace(skeleton, {
            position: Vector3.create(x, y, z),
            scale: Vector3.create(2, 2, 2), // Scale as needed
            rotation: Quaternion.fromEulerDegrees(0, Math.random() * 360, 0)
        })
        
        skeletons.push(skeleton)
    }

    createCandles()
    const x = Transform.get(skullPile).position;
    movePlayerTo({
        newRelativePosition: Vector3.create(x.x -12, 3, x.z + 4 ), // Top of the tube
        cameraTarget: Vector3.add(Vector3.create(7, 3, x.z + .6), Vector3.Down()), // Look down
    })
    
    
   
    console.log("Stage4 falling tube scene created")
}


function addSounds(){
    AudioSource.getMutable(heart).playing = true
    AudioSource.getMutable(heart).loop = true

    AudioSource.getMutable(final).playing = true
    AudioSource.getMutable(whisper).loop = true

    AudioSource.getMutable(dungeon).playing = false
}


export function cleanupStage4() {
    killAmbience();
    console.log("Cleaning up stage4...")
    
    // Remove rock (this will also remove skull pile and dozey as children)
    if (rock) {
        try {
            engine.removeEntityWithChildren(rock)
        } catch (e) {
            // Entity might already be removed
        }
        rock = null
    }
    
    // Remove sign
    if (sign) {
        try {
            engine.removeEntity(sign)
        } catch (e) {
            // Entity might already be removed
        }
        sign = null
    }
    
    // Remove all skeletons
    for (const skeleton of skeletons) {
        try {
            engine.removeEntity(skeleton)
        } catch (e) {
            // Entity might already be removed
        }
    }
    skeletons.length = 0 // Clear the array
    
    // Remove all candles
    for (const candle of candles) {
        try {
            engine.removeEntity(candle)
        } catch (e) {
            // Entity might already be removed
        }
    }
    candles.length = 0 // Clear the array
    
    // Remove all fire ground tiles
    for (const tile of fireGroundTiles) {
        try {
            engine.removeEntity(tile)
        } catch (e) {
            // Entity might already be removed
        }
    }
    fireGroundTiles.length = 0 // Clear the array
    
    // Remove skull pile
    if (skullPile) {
        try {
            engine.removeEntity(skullPile)
        } catch (e) {
            // Entity might already be removed
        }
        skullPile = null
    }
    
    // Remove dozey
    if (dozey) {
        try {
            engine.removeEntity(dozey)
        } catch (e) {
            // Entity might already be removed
        }
        dozey = null
    }
    
   
    const allGltfEntities = engine.getEntitiesWith(GltfContainer)
    const entitiesToRemove: Entity[] = [] // Collect entities to remove first

    for (const [entity] of allGltfEntities) {
        try {
            const gltf = GltfContainer.get(entity)
            // Only remove stage3-specific models
            if (gltf.src === 'models/pileskulls.glb' || 
                gltf.src === 'models/dozey.glb' || 
                gltf.src === 'models/skeleton.glb' ||
                gltf.src === 'models/sign.glb' ||
                gltf.src === 'models/candle.glb') {
                entitiesToRemove.push(entity) // Add to removal list instead of removing immediately
            }
            // Keep fog.glb, fence.glb, and other persistent models
        } catch (e) {
            // Entity might already be removed
        }
    }

    // Now remove all collected entities
    for (const entity of entitiesToRemove) {
        try {
            engine.removeEntity(entity)
        } catch (e) {
            // Entity might already be removed
        }
    }
    
   for (const angel of angels) {
        if (angel) {
            try {
                engine.removeEntity(angel)
            } catch (e) {
                // Entity might already be removed
            }
        }
    }
    angels.length = 0

    LightSource.getMutable(portalLight).active = false
    LightSource.getMutable(foglight).active = false

    engine.removeEntity(darkness_sphere)
    engine.removeSystem(fogRotationSystem)
    AudioSource.getMutable(angry).playing = false;
    AudioSource.getMutable(angry).loop = false;

    AudioSource.getMutable(heart).playing = false;
    AudioSource.getMutable(heart).loop = false;

    AudioSource.getMutable(wind).playing = false;
    AudioSource.getMutable(wind).loop = false;

    AudioSource.getMutable(whisper).playing = false;
    AudioSource.getMutable(whisper).loop = false;

    AudioSource.getMutable(final).playing = false;
    AudioSource.getMutable(final).loop = false;
    console.log("Stage4 cleanup completed")
}

function createCandles() {
    // Create 60 candles around the dozey area

    const totalCandles = 40; 
    const candleRadius = 14 // Distance from dozey
    
    const litCandles: Set<Entity> = new Set() // Track lit candles using a Set
    for (let i = 0; i < totalCandles; i++) {
        const candle = engine.addEntity()
        GltfContainer.createOrReplace(candle, {
            src: 'models/candle.glb',
            visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
        })

        Animator.createOrReplace(candle, {
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

        // Position candles in a circle around dozey
        const angle = (i / totalCandles) * Math.PI * 2
        const x = Math.cos(angle) * candleRadius
        const z = Math.sin(angle) * candleRadius
        const y = 0.5 // Slightly above ground
        
        Transform.createOrReplace(candle, {
            position: Vector3.create(x, y, z),
            scale: Vector3.create(0.5, 0.5, 0.5), // Smaller candles
            rotation: Quaternion.fromEulerDegrees(0, Math.random() * 360, 0)
        })
        

        // Add pointer interaction for clicking
        pointerEventsSystem.onPointerDown(
            {
                entity: candle,
                opts: { button: InputAction.IA_PRIMARY, hoverText: 'Light Candle' }
            },
            () => {
                // Check if this candle is already lit
                if (!litCandles.has(candle)) {
                    // Light the candle
                    litCandles.add(candle)
                    

                    Animator.getClip(candle, 'Flame').playing= true

                    utils.timers.setTimeout(() => {
                        Animator.getClip(candle, 'FlameIdle').playing= true
                    }, 500)
                    
                    
                    // Check if all candles are lit
                    if (litCandles.size === totalCandles) {
                        console.log("All candles lit! Teleportation activated!")
                        // Enable the teleportation trigger
                        
                        Animator.getClip(dozey!, "Dozing_Elderly").playing = false;
                        Animator.getClip(dozey!, 'Angry_To_Tantrum_Sit').playing = true;

                        AudioSource.getMutable(angry).playing = true
                        AudioSource.getMutable(angry).loop = true

                        AudioSource.getMutable(final).playing = false


                        // Timeline: Start from when this function is called
                        let timeline = 0

                        // Immediate - Stop angry animation, start scream
                        utils.timers.setTimeout(() => {
                            Animator.getClip(dozey!, 'Angry_To_Tantrum_Sit').playing = false;
                            Animator.getClip(dozey!, 'Zombie_Scream').playing = true;
                        }, timeline)

                        // 5s - Spawn angels
                        timeline += 5000
                        utils.timers.setTimeout(() => {
                            spawnAngels()
                        }, timeline)

                        // 30s - Transition to stage5 (5s + 25s)
                        timeline += 15000
                        utils.timers.setTimeout(() => {                            
                            fadeOut(() => {
                                    // Clean up stage4 while screen is black
                                cleanupStage4()
                                
                                // Import and create stage5
                                import('./stage5').then((stage5) => {
                                    stage5.createStage5Scene()

                                })
                            })
                        }, timeline)
                  
                       
                        utils.tweens.startScaling(
                            dozey!,
                            Vector3.create(1.1, 1.1, 1.1),
                            Vector3.create(3, 3, 3),
                            3,
                            utils.InterpolationType.EASEOUTQUAD,
                            () => {
                                //Billboard.createOrReplace(dozey!, { billboardMode: BillboardMode.BM_Y})


                        })

                        LightSource.getMutable(portalLight).active = false
                        const light = engine.addEntity();
                    
                        Transform.create(light, {
                        position: Vector3.create(0, 1, 0),
                        parent: dozey!
                        
                        })
                        LightSource.createOrReplace (light!, {
                            type: {
                                    $case: 'point',
                                    point: {}
                                },
                            color: Color3.Red(),
                            intensity: 53333322,//193456,
                        active: true})
                       
                    }
                } else {
                    console.log("This candle is already lit!")
                }
            }
        )
        
        
        candles.push(candle)
    }
    
    

   
}

let angels: Entity[] = []
export function spawnAngels() {
    const numberOfAngels = 1;
    console.log("Spawning 20 angels...")
    
    const darknessRadius = 10.5 // Same as darkness sphere radius
    const dozeyPos = Transform.get(dozey!).position
    const spawnDistance = darknessRadius + 15 // Spawn 15 units outside the darkness sphere
    
    for (let i = 0; i < numberOfAngels; i++) {
        const angel = engine.addEntity()
        
        // Create angel model
        GltfContainer.createOrReplace(angel, {
            src: 'models/angel.glb',
            visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
        })

        Animator.createOrReplace(angel, {
            states: [
                {
                    clip: "Sneaky_Walk_inplace",
                    playing: true,
                    loop: true
                },
                {
                    clip: "Zombie_Scream",
                    playing: false,
                    loop: true
                }
            ]
        })
        Animator.getClip(angel, "Sneaky_Walk_inplace").playing = true

        
        // Position angels in a circle around the darkness sphere
        const angle = (i / numberOfAngels) * Math.PI * 2
        const x = Math.cos(angle) * spawnDistance
        const z = Math.sin(angle) * spawnDistance
        const y = 2 + Math.random() * 3 // Random height between 2-5
        
        Transform.createOrReplace(angel, {
            position: Vector3.create(x, 0, z),
            scale: Vector3.create(1.5, 1.5, 1.5),
            rotation: Quaternion.fromEulerDegrees(0, Math.random() * 360, 0)
        })
        
        angels.push(angel)
    }
    
    // Start the angel movement system
    startAngelMovement()
    
    console.log("20 angels spawned and moving toward dozey")
}

function startAngelMovement() {
    const angelMovementSystem = (dt: number) => {
        if (angels.length === 0) return
        
        const dozeyPos = Transform.get(engine.PlayerEntity).position
        
        for (const angel of angels) {
            if (!Transform.has(angel)) continue
            
            const angelTransform = Transform.getMutable(angel)
            const angelPos = angelTransform.position
            
            // Calculate direction to dozey
            const dx = dozeyPos.x - angelPos.x
            const dz = dozeyPos.z - angelPos.z
            const distance = Math.sqrt(dx * dx + dz * dz)
            
            // Only move if not too close to dozey
            if (distance > 2) {
                const speed = 1.5 * dt // Adjust speed as needed
                const moveX = (dx / distance) * speed
                const moveZ = (dz / distance) * speed
                
                angelPos.x += moveX
                angelPos.z += moveZ
                
                // Face the direction of movement
                const lookDirection = Vector3.create(dx, 0, dz)
                if (Vector3.length(lookDirection) > 0.001) {
                    angelTransform.rotation = Quaternion.lookRotation(lookDirection)
                }

                Animator.getClip(angel, "Sneaky_Walk_inplace").playing = true
                Animator.getClip(angel, "Zombie_Scream").playing = false

            } else{
                Animator.getClip(angel, "Sneaky_Walk_inplace").playing = false
                Animator.getClip(angel, "Zombie_Scream").playing = true
            }
        }
    }
    
    engine.addSystem(angelMovementSystem)
}