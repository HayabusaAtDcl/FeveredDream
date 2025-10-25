import { engine, Entity, GltfContainer, Transform, ColliderLayer, triggerAreaEventsSystem, TriggerArea, Animator, LightSource, Material, MeshRenderer, AudioSource } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color4 } from "@dcl/sdk/math";
import { movePlayerTo } from "~system/RestrictedActions";
import * as utils from '@dcl-sdk/utils'
import {  portalLight, expandFog } from "./landscape";
import { fadeTransition } from "./ui";
import { heart, creaky, whisper, dungeon } from "./utils";

// Global references
let spiral2: Entity | null = null
let skeletons: Entity[] = []
let bottomLight: Entity | null = null


export function createStage3Scene() {
    addSounds()
    console.log("Creating stage3 scene with spiral2 and fire walls...")
    
    // Expand fog to be much larger for stage3
    expandFog()
    
    // Create the spiral2 model
    spiral2 = engine.addEntity()
    GltfContainer.createOrReplace(spiral2, {
        src: 'models/spiral4.glb',
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask: ColliderLayer.CL_NONE
    })
    
    Transform.createOrReplace(spiral2, {
        position: Vector3.create(0, 22, 0),
        scale: Vector3.create(22, 22, 22), // Scale as requested
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    
    // Create 20 skeletons scattered around the spiral
    createSkeletons()
 
    utils.timers.setTimeout(() => {
        movePlayerTo({
            newRelativePosition: Vector3.create(-0.50, 41.05, -9), // At the top of the spiral
    
    
            cameraTarget: Vector3.create(10, 30, 10),
        })

    }, 4000);
    
    
    createVortex()
    
    //createVirtualCamera()
    console.log("Stage3 spiral scene created")
}

function createSkeletons() {
    // Create 20 skeletons within the spiral GLB model
    const skeletonCount = 20
    const spiralRadius = 10 // Within the spiral radius
    const maxHeight = 50 // Up to height 50
    
    for (let i = 0; i < skeletonCount; i++) {
        const skeleton = engine.addEntity()
        
        // Create skeleton with random position within the spiral
        const angle = Math.random() * Math.PI * 2 // Random angle
        const distance = Math.random() * spiralRadius // Random distance within radius 10
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance
        const y = Math.random() * maxHeight // Random height up to 50
        
        GltfContainer.createOrReplace(skeleton, {
            src: 'models/skeleton.glb',
            visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
        })

        // Add animation
        Animator.createOrReplace(skeleton, {
            states: [
                {
                    clip: "Swim_Idle",
                    playing: true,
                    loop: true
                }
            ]
        })
        
        Transform.createOrReplace(skeleton, {
            position: Vector3.create(x, y, z),
            scale: Vector3.create(2, 2, 2), // Scale as needed
            rotation: Quaternion.fromEulerDegrees(0, Math.random() * 360, 0) // Random rotation
        })
        
        skeletons.push(skeleton)
    }

    console.log(`${skeletonCount} skeletons created within the spiral`)
}


let vortex: Entity | null = null
function createVortex() {
    vortex = engine.addEntity()
    
    // If you have a different model name
    GltfContainer.createOrReplace(vortex, {
        src: 'models/vortex.glb', // or whatever your vortex model is called
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask: ColliderLayer.CL_NONE
    })
    
    Transform.createOrReplace(vortex, {
        position: Vector3.create(4, .3, 8), // Bottom of spiral
        scale: Vector3.create(3, 3, 3), // Adjust scale as needed
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })

    // Add trigger area to the vortex for teleportation
    TriggerArea.setBox(vortex)
    triggerAreaEventsSystem.onTriggerEnter(vortex, () => {
        console.log("Player touched vortex - teleporting to stage4")
        
        // Use UI fade transition
        fadeTransition(() => {
            // Clean up stage3 while screen is black
            cleanupStage3()
            
            // Import and create stage4
            import('./stage4').then((stage4) => {
                stage4.createStage4Scene()
            })
        })
    })

    const mutableLight = Transform.getMutable(portalLight)
    mutableLight.position = Vector3.create(4, .3, 8)
    mutableLight.parent = undefined

    LightSource.getMutable(portalLight).active = true
    

    
    return vortex
}

function addSounds(){
    AudioSource.getMutable(heart).playing = true
    AudioSource.getMutable(heart).loop = true

    
    AudioSource.getMutable(creaky).playing = false

    AudioSource.getMutable(whisper).playing = false

    AudioSource.getMutable(dungeon).playing = true
    AudioSource.getMutable(whisper).loop = true
}

export function cleanupStage3() {
    console.log("Cleaning up stage3...")
    
    // Remove spiral2
    if (spiral2) {
        try {
            engine.removeEntity(spiral2)
        } catch (e) {
            // Entity might already be removed
        }
        spiral2 = null
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
    
   
    
    // Remove vortex
    if (vortex) {
        try {
            engine.removeEntity(vortex)
        } catch (e) {
            // Entity might already be removed
        }
        vortex = null
    }
    
    // Turn off portal light and reset its parent
    //LightSource.getMutable(portalLight).active = false
    //const portalTransform = Transform.getMutable(portalLight)
    //portalTransform.parent = undefined // Remove parent reference
    //portalTransform.position = Vector3.create(0, 0, 0) // Reset position
    
    console.log("Stage3 cleanup completed")
}