import { Entity, engine, AvatarShape, Transform, AudioSource, GltfContainer, ColliderLayer, LightSource, MeshRenderer, MeshCollider, Material, MainCamera, VirtualCamera, InputModifier, VideoPlayer, GltfNodeModifiers, MaterialTransparencyMode } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color3, Color4 } from "@dcl/sdk/math"
import { WearableBodyShape, cryWomanSound } from "./utils"
import * as utils from '@dcl-sdk/utils'
import { movePlayerTo, triggerSceneEmote } from "~system/RestrictedActions"
import { portalLight } from "./landscape"
import { userData } from "."
import { EndScreen } from "./ui/components/UIComponents"
import { fadeIn, showEndScreen } from "./ui"


let wall1: Entity | null = null
let wall2: Entity | null = null
let wall3: Entity | null = null
let floor: Entity | null = null
let ceiling: Entity | null = null
export function createStage5Scene() {
       
     InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: InputModifier.Mode.Standard({
            disableAll: true,
        }),
     }) 

     const cam = engine.addEntity()
    Transform.createOrReplace(cam,
        {
            position: Vector3.create(0, 16.5, -1.5)
        }
    )
    VirtualCamera.create(cam, {})

    MainCamera.createOrReplace(engine.CameraEntity, {
        virtualCameraEntity: cam,
    }) 
    
   
    const tv = engine.addEntity()

    GltfContainer.create(tv, {
        src: 'models/tv2.glb',
      
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
            
    // Update TV position to be at the same location
    Transform.create(tv, {
        position: Vector3.create(0, 14.95, 5.5), // Move TV to same position as wall
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })

    VideoPlayer.create(tv, {
        src: 'videos/angel.mp4',
        playing: true,
        loop: true,
     })

     GltfNodeModifiers.create(
        tv,
        {
            modifiers: [{
                path: 'Screen',
                material: {
                    material: {
                        $case: 'pbr', pbr: {
                            texture: Material.Texture.Video({
                                videoPlayerEntity: tv,
                            }),
                        },
                    },
                },
            }],
        })

    
   
    wall1 = engine.addEntity()
    MeshRenderer.setPlane(wall1)

    // Update wall position - move it back so edge meets floor edge
    Transform.create(wall1, {
        position: Vector3.create(0, 16, 6), // Moved back to align with floor edge
        scale: Vector3.create(8, 8,  2), // Small wall size
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })

    // Add black material to the wall
    Material.setPbrMaterial(wall1, {
        albedoColor: Color4.Black(), // Use Color4 for correct type with alpha
        metallic: 0,
        roughness: 1
    })

    

    wall2 = engine.addEntity()
    MeshRenderer.setPlane(wall2)

    // Update wall position - move it back so edge meets floor edge
    Transform.create(wall2, {
        position: Vector3.create(2, 16, 4), // Moved back to align with floor edge
        scale: Vector3.create(8, 8, 2), // Small wall size
        rotation: Quaternion.fromEulerDegrees(0, 90, 0) // Facing forward
    })

    // Add black material to the wall
    Material.setPbrMaterial(wall2, {
        albedoColor: Color4.Black(), // Use Color4 for correct type with alpha
        metallic: 0,
        roughness: 1
    })

    wall3 = engine.addEntity()
    MeshRenderer.setPlane(wall3)

    // Update wall position - move it back so edge meets floor edge
    Transform.create(wall3, {
        position: Vector3.create(-2, 16, 4), // Moved back to align with floor edge
        scale: Vector3.create(8, 8, 2), // Small wall size
        rotation: Quaternion.fromEulerDegrees(0, 90, 0) // Facing forward
    })

    // Add black material to the wall
    Material.setPbrMaterial(wall3, {
        albedoColor: Color4.Black(), // Use Color4 for correct type with alpha
        metallic: 0,
        roughness: 1
    }) 


    // Add black floor
    floor = engine.addEntity()
    MeshRenderer.setPlane(floor)
    MeshCollider.setPlane(floor)

    // Update floor position to match
    Transform.create(floor, {
        position: Vector3.create(0, 14, 4), // Align with wall edge
        scale: Vector3.create(8, 8, 2), // Larger than the wall to create a proper floor
        rotation: Quaternion.fromEulerDegrees(90, 0, 0) // Rotate 90 degrees to lay flat
    })

    // Add black material to the floor
    Material.setPbrMaterial(floor, {
        albedoColor: Color4.Black(),
        metallic: 0,
        roughness: 1
    })

    // Add black floor
    ceiling = engine.addEntity()
    MeshRenderer.setPlane(ceiling)
   

    // Update floor position to match
    Transform.create(ceiling, {
        position: Vector3.create(0, 20, 4), // Align with wall edge
        scale: Vector3.create(8, 8, 2), // Larger than the wall to create a proper floor
        rotation: Quaternion.fromEulerDegrees(90, 0, 0) // Rotate 90 degrees to lay flat
    })

    // Add black material to the floor
    Material.setPbrMaterial(ceiling, {
        albedoColor: Color4.Black(),
        metallic: 0,
        roughness: 1
    })

    const floor2 = engine.addEntity()
    MeshRenderer.setPlane(floor2)
    MeshCollider.setPlane(floor2)

    // Update floor position to match
    Transform.create(floor2, {
        position: Vector3.create(0, 14, 4), // Align with wall edge
        scale: Vector3.create(8, 8, 2), // Larger than the wall to create a proper floor
        rotation: Quaternion.fromEulerDegrees(90, 0, 0) // Rotate 90 degrees to lay flat
    })

    // Add black material to the floor
    Material.setPbrMaterial(floor2, { albedoColor: Color4.Clear() , castShadows: false})

    let timeline = 0

    // 2s - Move player
    timeline += 1000
    utils.timers.setTimeout(() => {
        movePlayerTo({
            newRelativePosition: Vector3.create(0, 15, 4),
            cameraTarget: Vector3.add(Vector3.create(0, 15, 4), Vector3.Up()),
        })
    }, timeline)

    // 5s - Trigger emote (2s + 3s)
    timeline += 2500
    utils.timers.setTimeout(() => {
        triggerSceneEmote({ src: 'animations/nap_emote.glb', loop: true })
    }, timeline)

    // 15s - Fade in (2s)
    timeline +=  2500
    utils.timers.setTimeout(() => {
        fadeIn()
    }, timeline)


    timeline += 10000
    utils.timers.setTimeout(() => {
        triggerSceneEmote({ src: 'animations/naploop_emote.glb', loop: true })
    }, timeline)

    

    
    // 25s - Create giant NPC
    timeline += 20000
    utils.timers.setTimeout(() => {
        createGiantNpc(userData)
    }, timeline)

    
    // 27.5s - Remove walls (25s + 2.5s)
    timeline += 2500
    utils.timers.setTimeout(() => {
        removeWallFloor()
        
        const mainCamera = MainCamera.createOrReplace(engine.CameraEntity, {
            virtualCameraEntity: undefined,
        })

        InputModifier.createOrReplace(engine.PlayerEntity, {
            mode: InputModifier.Mode.Standard({
                disableAll: false,
            }),
        })
    }, timeline)

    // 52.5s - Show end screen (27.5s + 25s)
    timeline += 25000
    utils.timers.setTimeout(() => {
        showEndScreen()
    }, timeline)       
   
}

function removeWallFloor(){
    if(wall1)
        engine.removeEntity(wall1)

    if(wall2)
        engine.removeEntity(wall2)

    if(wall3)
        engine.removeEntity(wall3)

    if(floor)
        engine.removeEntity(floor)

    if(ceiling)
        engine.removeEntity(ceiling)
}


let giantNPC: Entity | null = null
function createGiantNpc(userData: any) {

    
    const bubble = engine.addEntity()

    GltfContainer.create(bubble, {
        src: 'models/marble.glb',
      
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
            
    Transform.create(bubble, {
      position: Vector3.create(0, 16.5, 4),
      scale: Vector3.create(4,4,4),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })



    // Create the NPC entity
    giantNPC = engine.addEntity()
    
    AvatarShape.createOrReplace(giantNPC, {
        id: '',
        emotes:[],
        wearables: userData.data?.avatar?.wearables || [],
        bodyShape: userData.data?.avatar?.bodyShape,
        eyeColor: Color3.fromHexString(userData.data?.avatar?.eyeColor || ""),
        skinColor: Color3.fromHexString(userData.data?.avatar?.skinColor || ""),
        hairColor: Color3.fromHexString(userData.data?.avatar?.hairColor || ""),
        expressionTriggerId: 'animations/giant_emote.glb',
        expressionTriggerTimestamp: 0           
    })
    
    // Position the NPC on the boat
    Transform.createOrReplace(giantNPC, {
        position: Vector3.create(0, 0, 0), // Lower on the boat deck
        scale: Vector3.create(30, 30, 30),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })
    
  
    const npc = AvatarShape.getMutable(giantNPC!);
    npc.expressionTriggerTimestamp =  Date.now()
    npc.expressionTriggerId = 'animations/giant_emote.glb'

  
    let emoteTimer = 0
    const emoteDuration = 8 // seconds

    engine.addSystem((dt: number) => {
      emoteTimer += dt

      if (emoteTimer >= emoteDuration) {
        const npc = AvatarShape.getMutableOrNull(giantNPC!)
        if (npc) {
          npc.expressionTriggerId = 'animations/giant_emote.glb'
          npc.expressionTriggerTimestamp = Date.now() // ensures trigger
        }

        emoteTimer = 0
      }
    })

    
}