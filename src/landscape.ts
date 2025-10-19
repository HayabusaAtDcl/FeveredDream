import { Vector3, Quaternion, Color3 } from '@dcl/sdk/math'
import { GltfContainer, LightSource, Transform, engine } from '@dcl/sdk/ecs'

export function addFog(){
    const darkness_range = 10.5;
    let darkness_sphere = engine.addEntity()
    GltfContainer.createOrReplace(darkness_sphere, {
        src: 'models/fog.glb'
    })

    Transform.createOrReplace(darkness_sphere,
        {
            position:  Vector3.create(8,0,8),
            scale: Vector3.create(darkness_range, darkness_range , darkness_range)
        }
    )
    
  

    const rotationSpeed = 0.02 // radians per second

    // system that runs every tick
    const stageRotationSystem = (dt: number) => {

        // Check if darkness_sphere still exists
       
        const transform = Transform.getMutable(darkness_sphere)
        const deltaRotation = Quaternion.fromEulerDegrees(0, 30 * dt, 0) // 30° per sec
        transform.rotation = Quaternion.multiply(deltaRotation, transform.rotation)

        Transform.getMutable(darkness_sphere).position = Transform.get(engine.PlayerEntity).position;
    }
    engine.addSystem(stageRotationSystem)


}

export const light = engine.addEntity();

export function setLight(){
  
  
    
    Transform.createOrReplace(light, {
      position: Vector3.create(0, 0, 0)
     
    })
  
      LightSource.createOrReplace (light, {
        type: {
                $case: 'point',
                point: {}
              },
        color: Color3.Red(),
        intensity: 1111441,//193456,
      active: false})

   /*    const playerPos = Transform.get(engine.PlayerEntity).position
          const mutableLight = Transform.getMutable(light)
            mutableLight.position = Vector3.create( playerPos.x+5, 18, playerPos.x+5)

            LightSource.getMutable(light).active = true */

}