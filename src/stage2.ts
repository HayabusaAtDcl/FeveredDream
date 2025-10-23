import { engine, Entity, GltfContainer, Transform, Material, MeshRenderer, MeshCollider, ColliderLayer, EntityUtils, Tween, triggerAreaEventsSystem, TriggerArea, TweenLoop, EasingFunction, TweenSequence, Animator, VideoPlayer, AudioSource, pointerEventsSystem, InputAction, LightSource } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color3, Color4 } from "@dcl/sdk/math";
import { movePlayerTo } from "~system/RestrictedActions";
import * as utils from '@dcl-sdk/utils'
import { creaky, heart, whisper, wind } from "./utils";
import { portalLight } from "./landscape";
import { fadeTransition } from "./ui";
// Global reference to the grim reaper boat entity
let grimReaperBoat: Entity | null = null


// Global reference to the darkness sphere from stage1

let waterGround: Entity | null = null
let skull: Entity | null = null

let vortexStage2: Entity | null = null
let wallparent: Entity | null = null


const candles: Entity[] = []
export function createGrimReaperBoatScene() {
    addSounds()
    addWalls()
    addSkeletons()
    console.log("Creating grim reaper boat scene...")
    
    // Create the grim reaper boat entity
    grimReaperBoat = engine.addEntity()
    GltfContainer.createOrReplace(grimReaperBoat, {
        src: 'models/grimreaper.glb',
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask: ColliderLayer.CL_NONE
    })
    
    // Add a box collider for the player to stand on
    //MeshCollider.setPlane(grimReaperBoat)
    
    const playerPos = Transform.get(engine.PlayerEntity).position;
    
    // Position the boat at the center
    Transform.createOrReplace(grimReaperBoat, {
        position: Vector3.create(playerPos.x, 2, playerPos.z),
        scale: Vector3.create(3, 3, 3),
        rotation: Quaternion.fromEulerDegrees(0, 90, 0)
    })
    
    // Create a water-like ground plane    
    waterGround = engine.addEntity()

    // Add the mesh renderer for the plane
    MeshRenderer.createOrReplace(waterGround, {
        mesh: {
            $case: 'plane',
            plane: { uvs: [0,0, 0,1, 1,1, 1,0] },
        },
    })

    VideoPlayer.createOrReplace(waterGround, {
        src: 'videos/water.mp4',
        playing: true,
        loop: true, // Add this to make it loop
    })

    // Create the video texture
    const videoTexture = Material.Texture.Video({ videoPlayerEntity: waterGround })

    // Set the basic material with video texture
    Material.setBasicMaterial(waterGround, {
        texture: videoTexture,
    })


    Transform.createOrReplace(waterGround, {
        position: Vector3.create(0, 0, 0),
        scale: Vector3.create(200, 200, 1), // Large scale to cover the area
        rotation: Quaternion.fromEulerDegrees(-90, 0, 0)
    })

   


    TriggerArea.setBox(waterGround)
    triggerAreaEventsSystem.onTriggerEnter(waterGround, () => {
        movePlayerToBoat();
        console.log("Player touched water - teleporting back to boat")
    });
    
    // Get the water ground dimensions
    const waterScale = 200 // Your water ground scale
    const halfScale = waterScale / 2 // Half the size to get the edges

    // Start position (middle left)
    const startPos = Vector3.create(-halfScale + 40, 2, 0) // Middle-left
    //const startPos = Vector3.create(halfScale -40, 2, 0)
    // End position (middle right)  
    const endPos = Vector3.create(halfScale -40, 2, 0) // Middle-right

     // Create the skull at the end position
     skull = engine.addEntity()
     GltfContainer.createOrReplace(skull, {
         src: 'models/headwall.glb',
         visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
     })
 
     
    Transform.createOrReplace(skull, {
        position: Vector3.create(endPos.x + 21.8, 15, endPos.z), // Slightly lower than the boat
        scale: Vector3.create(20, 20, 20), // Super big skull!
        rotation: Quaternion.fromEulerDegrees(0, -90, 0)
    })
    

    vortexStage2 = engine.addEntity()
    GltfContainer.createOrReplace(vortexStage2, {
        src: 'models/vortex.glb',
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask: ColliderLayer.CL_NONE
    })
    Transform.createOrReplace(vortexStage2, {
        position: Vector3.create(0, -0.69, -0.7), // Center of the skull // Slightly above the plane, centered in candles
        scale: Vector3.create(0.1, 0.1, 0.1),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0),
        parent: skull
    })

    
    const litCandles: Set<Entity> = new Set() // Track lit candles using a Set
    
    // Position candles in a circle on top of the vortex (relative to vortex's local space)
    const radius = 0.15 // Circle radius around the vortex center
    const candlePositions = [
        Vector3.create(radius, 0.05, 0),       // Right
        Vector3.create(0, 0.05, radius),       // Front
        Vector3.create(-radius, 0.05, 0),      // Left
        Vector3.create(0, 0.05, -radius)       // Back
    ]

    const totalCandles = 4

    for (let i = 0; i < 4; i++) {
        const candle = engine.addEntity()
        GltfContainer.createOrReplace(candle, {
            src: 'models/candle.glb' // Your candle model
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

        
        Transform.createOrReplace(candle, {
            position: candlePositions[i],
            scale:  Vector3.create(0.1, .1, 0.1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),
            parent: vortexStage2 // Make them relative to the teleport plane
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
                    
                    console.log(`Candle ${i + 1} lit! (${litCandles.size}/${totalCandles})`)
                    
                    // Check if all candles are lit
                    if (litCandles.size === totalCandles) {
                        console.log("All candles lit! Teleportation activated!")

                        
                        const mutableLight = Transform.getMutable(portalLight)
                        mutableLight.position = Vector3.create(0, -0.55, 0.0) // Same as vortex position
                        mutableLight.parent = vortexStage2! // Parent to skull so it moves with it
                        
                        
                        LightSource.getMutable(portalLight).active = true
                        
                       

                        TriggerArea.setBox(vortexStage2!)
                    }
                } else {
                    console.log("This candle is already lit!")
                }
            }
        )
        
        candles.push(candle)
    }

   

    // Modified teleportation trigger (only works when all candles are lit)
    triggerAreaEventsSystem.onTriggerEnter(vortexStage2, () => {
        if (litCandles.size === totalCandles) {
            console.log("Player stepped on skull - teleporting to stage3")
            
            // Use UI fade transition
            fadeTransition(() => {
                // Clean up stage2 while screen is black
                cleanupGrimReaperBoatScene()
                
                // Import and create stage3
                import('./stage3').then((stage3) => {
                    stage3.createStage3Scene()
                })
            })
        } else {
            console.log(`Need to light all candles first! (${litCandles.size}/${totalCandles})`)
        }
    })

    // Position the boat at the start
    Transform.createOrReplace(grimReaperBoat, {
        position: startPos,
        scale: Vector3.create(3, 3, 3),
        rotation: Quaternion.fromEulerDegrees(0, 90, 0)
    })

    // Create tween to move from middle left to middle right
    Tween.create(grimReaperBoat, {
        duration: 100000, // 10 seconds to cross
        easingFunction: EasingFunction.EF_LINEAR,
        mode: Tween.Mode.Move({
            start: startPos,
            end: endPos,
        }),
    })
    
    
    
    // Initially position player on the boat
    movePlayerToBoat();

}

function movePlayerToBoat(){
    const boatPos = Transform.get(grimReaperBoat!).position;
    // Calculate future position based on tween progress
    const startPos = Vector3.create(-100, 3, 0)
    const endPos = Vector3.create(100, 3, 0)
    const totalDistance = Vector3.distance(startPos, endPos)
    const currentDistance = Vector3.distance(startPos, boatPos)
    const progress = currentDistance / totalDistance
    
    // Teleport to where boat will be in 2 seconds
    const futureProgress = Math.min(progress + 0.02, 1.0) // 10% ahead
    const futurePos = Vector3.lerp(startPos, endPos, futureProgress)
    
    movePlayerTo({
        newRelativePosition: futurePos,
        cameraTarget: Vector3.add(futurePos, Vector3.Up()),
    })  
}

export function cleanupGrimReaperBoatScene() {
    console.log("Cleaning up grim reaper boat scene...")
   
    
    // Remove the boat entity
    if (grimReaperBoat) {
        try {
            engine.removeEntity(grimReaperBoat)
        } catch (e) {
            // Entity might already be removed
        }
        grimReaperBoat = null
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
    candles.length = 0 // Clear the candles array
    
    // Remove water ground
    if (waterGround) {
        try {
            if (VideoPlayer.has(waterGround)) {
                const videoPlayer = VideoPlayer.getMutable(waterGround)
                videoPlayer.playing = false
                VideoPlayer.deleteFrom(waterGround)
            }
            engine.removeEntity(waterGround)
        } catch (e) {
            // Entity might already be removed
        }
        waterGround = null
    }

    // Remove skull
    if (skull) {
        try {
            engine.removeEntity(skull)
        } catch (e) {
            // Entity might already be removed
        }
        skull = null
    }
    
    // Turn off portal light and reset its parent
    LightSource.getMutable(portalLight).active = false
    const portalTransform = Transform.getMutable(portalLight)
    portalTransform.parent = undefined // Remove parent reference
    portalTransform.position = Vector3.create(0, 0, 0) // Reset position
    

    // Remove vortex at candles center if present
    if (vortexStage2) {
        try {
            engine.removeEntity(vortexStage2)
        } catch (e) {
            // Entity might already be removed
        }
        vortexStage2 = null
    }

    // Remove all walls
    if (wallparent) {
        try {
            engine.removeEntityWithChildren(wallparent)
        } catch (e) {
            // Entity might already be removed
        }
        wallparent = null
    }
    
    console.log("Grim reaper boat scene cleanup completed")
}

function addWalls(){
    // Create the parent entity for all walls
    wallparent = engine.addEntity()
    
    // Create black walls around the water ground perimeter
    const waterScale = 200 // Your water ground scale
    const halfScale = waterScale / 2
    const wallHeight = 25
    const wallThickness = 2

    // North wall (top edge of water)
    const northWall = engine.addEntity()
    MeshRenderer.create(northWall, {
        mesh: {
            $case: 'box',
            box: { uvs: [] },
        },
    })
    Material.setPbrMaterial(northWall, {
        albedoColor: Color4.create(0, 0, 0, 1), // Black
        specularIntensity: 0,
        roughness: 1,
        metallic: 0
    })
    Transform.createOrReplace(northWall, {
        position: Vector3.create(0, wallHeight/2, halfScale), // Right at the edge
        scale: Vector3.create(waterScale, wallHeight, wallThickness),
        parent: wallparent
    })

    // South wall (bottom edge of water)
    const southWall = engine.addEntity()
    MeshRenderer.create(southWall, {
        mesh: {
            $case: 'box',
            box: { uvs: [] },
        },
    })
    Material.setPbrMaterial(southWall, {
        albedoColor: Color4.create(0, 0, 0, 1), // Black
        specularIntensity: 0,
        roughness: 1,
        metallic: 0
    })
    Transform.createOrReplace(southWall, {
        position: Vector3.create(0, wallHeight/2, -halfScale), // Right at the edge
        scale: Vector3.create(waterScale, wallHeight, wallThickness),
        parent: wallparent
    })

    // East wall (right edge of water)
    const eastWall = engine.addEntity()
    MeshRenderer.create(eastWall, {
        mesh: {
            $case: 'box',
            box: { uvs: [] },
        },
    })
    Material.setPbrMaterial(eastWall, {
        albedoColor: Color4.create(0, 0, 0, 1), // Black
        specularIntensity: 0,
        roughness: 1,
        metallic: 0
    })
    Transform.createOrReplace(eastWall, {
        position: Vector3.create(halfScale, wallHeight/2, 0), // Right at the edge
        scale: Vector3.create(wallThickness, wallHeight, waterScale),
        parent: wallparent
    })

    // West wall (left edge of water)
    const westWall = engine.addEntity()
    MeshRenderer.create(westWall, {
        mesh: {
            $case: 'box',
            box: { uvs: [] },
        },
    })
    Material.setPbrMaterial(westWall, {
        albedoColor: Color4.create(0, 0, 0, 1), // Black
        specularIntensity: 0,
        roughness: 1,
        metallic: 0
    })
    Transform.createOrReplace(westWall, {
        position: Vector3.create(-halfScale, wallHeight/2, 0), // Right at the edge
        scale: Vector3.create(wallThickness, wallHeight, waterScale),
        parent: wallparent
    })
}

const skeletons: Entity[] = []
function addSkeletons(){
    // Create 10 skeletons around the boat route
    const skeletonCount = 20
    

    for (let i = 0; i < skeletonCount; i++) {
        const skeleton = engine.addEntity()
        
        // Create skeleton with random position along the route
        const routeProgress = i / (skeletonCount - 1) // 0 to 1 along the route
        const startPos = Vector3.create(-180, 0, 0) // Your start position
        const endPos = Vector3.create(180, 0, 0) // Your end position
        const skeletonPos = Vector3.lerp(startPos, endPos, routeProgress)
        
        // Add some random offset to the sides
        const sideOffset = (Math.random() - 0.5) * 20 // Random offset -10 to +10
        skeletonPos.z += sideOffset
        
        GltfContainer.createOrReplace(skeleton, {
            src: 'models/skeleton.glb' // Your skeleton model
        })
        
        Transform.createOrReplace(skeleton, {
            position: Vector3.create(skeletonPos.x, 0, skeletonPos.z), // On the ground
            scale: Vector3.create(2, 2, 2), // Scale as needed
            rotation: Quaternion.fromEulerDegrees(0, Math.random() * 360, 0) // Random rotation
        })
        
        // Add animation with random choice between the 2 animations
        //const animationName = Math.random() < 0.5 ? 'Swim_Forward' : 'Swim_Idle' // Random choice
        
        Animator.create(skeleton, {
            states: [
                {
                    clip: "Swim_Idle",
                    playing: true,
                    loop: true
                }
            ]
        })
        Animator.getClip(skeleton, "Swim_Idle").playing = true
        skeletons.push(skeleton)
    }
}

function addSounds(){
    AudioSource.getMutable(heart).playing = true
    AudioSource.getMutable(heart).loop = true

    
    AudioSource.getMutable(creaky).playing = true
    AudioSource.getMutable(creaky).loop = true

    AudioSource.getMutable(whisper).playing = true
    AudioSource.getMutable(whisper).loop = true
}