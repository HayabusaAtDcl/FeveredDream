import { Vector3, Quaternion, Color3 } from '@dcl/sdk/math'
import { GltfContainer, LightSource, Transform, engine } from '@dcl/sdk/ecs'

// Global references for fog control
export let darkness_sphere: any = null
export let fogRotationSystem: any = null

export function addFog(){
    const darkness_range = 10.5;
    darkness_sphere = engine.addEntity()
    GltfContainer.createOrReplace(darkness_sphere, {
        src: 'models/fog-update.glb'
    })

    Transform.createOrReplace(darkness_sphere,
        {
            position:  Vector3.create(8,-0.5,8),
            scale: Vector3.create(darkness_range, darkness_range , darkness_range)
        }
    )
    
  

    const rotationSpeed = 0.02 // radians per second

    // system that runs every tick
    fogRotationSystem = (dt: number) => {

        // Check if darkness_sphere still exists
       
        const transform = Transform.getMutable(darkness_sphere)
        const deltaRotation = Quaternion.fromEulerDegrees(0, 30 * dt, 0) // 30° per sec
        transform.rotation = Quaternion.multiply(deltaRotation, transform.rotation)

        Transform.getMutable(darkness_sphere).position = Transform.get(engine.PlayerEntity).position;
    }
    engine.addSystem(fogRotationSystem)


}

export const foglight = engine.addEntity();
export const portalLight = engine.addEntity();
export function setLight(){
    
    Transform.createOrReplace(foglight, {
      position: Vector3.create(0, 0, 0)
     
    })
  
    LightSource.createOrReplace (foglight, {
    type: {
            $case: 'point',
            point: {}
            },
    color: Color3.Red(),
    intensity: 1111441,//193456,
    active: false})

    Transform.createOrReplace(portalLight, {
      position: Vector3.create(0, 0, 0)
     
    })
  
    LightSource.createOrReplace (portalLight, {
    type: {
            $case: 'point',
            point: {}
            },
    color: Color3.Red(),
    intensity: 5333333,
    active: false})

}

// Scale fog to be much larger (for stage 3)
export function expandFog() {
    if (darkness_sphere) {
        const transform = Transform.getMutable(darkness_sphere)
        
        transform.scale = Vector3.create(15,15,15) // Much larger
        console.log("Fog expanded to scale 100")
    }
}

// Scale fog back to normal size (for stage 4)
export function shrinkFog() {
    if (darkness_sphere) {
        const darkness_range = 10.5
        const transform = Transform.getMutable(darkness_sphere)
        transform.scale = Vector3.create(darkness_range, darkness_range, darkness_range)
        console.log("Fog shrunk back to normal scale:", darkness_range)
    }
}