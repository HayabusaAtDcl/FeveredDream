import { AudioSource, ColliderLayer, engine, Entity, GltfContainer, InputModifier, LightSource, Material,
    MeshCollider, MeshRenderer, Transform, 
    TriggerArea,
    triggerAreaEventsSystem,
    VirtualCamera,
    MainCamera } from "@dcl/sdk/ecs";
import { Vector3, Quaternion } from "@dcl/sdk/math";
import { activateAngels, candleSystem, createCandle, forceLightCandle, gameOver, setGameOver } from "./candle";
import { triggerSceneEmote } from "~system/RestrictedActions";
import { foglight, setLight } from "./landscape";
import { heart, wind } from "./utils";
import { isGameStarted, fadeTransition } from "./ui";
import * as utils from '@dcl-sdk/utils'
const WALL_MODEL_PATH = "models/fence.glb"
export interface EntityStatus  {
    used: boolean,
    entity: Entity
}


class Cell {
    
    public x;
    public y;
    public visited;
    public grid: any;
    public stage;
    public reveal = 0;
    public type = 0;

    public walls: boolean[]                = [];

    public wall_ents : EntityStatus[]           = [];
    public floor_ents: EntityStatus[]           = [];
    public ceiling_ents  : EntityStatus[]       = [];
    public lighting_ents  : EntityStatus[]      = [];
    public pillar_ents : EntityStatus[]         = [];
    public tree_ents : EntityStatus[]         = [];

   
    

    //--------------------
    constructor( stage: Stage , x: number, y: number) {
        
        this.stage = stage;
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true];
        this.visited = false;

    }

    
    //--------------------
    checkNeighbors() {

		var neighbors = [];
	
		var top     = this.stage.grid[this.stage.cell_index_by_coord( this.x      , this.y - 1    )];
		var right   = this.stage.grid[this.stage.cell_index_by_coord( this.x + 1  , this.y        )];
		var bottom  = this.stage.grid[this.stage.cell_index_by_coord( this.x      , this.y + 1    )];
		var left    = this.stage.grid[this.stage.cell_index_by_coord( this.x - 1  , this.y        )];
	
		if (top && !top.visited) {
			neighbors.push(top);
		}
		if (right && !right.visited) {
			neighbors.push(right);
		}
		if (bottom && !bottom.visited) {
			neighbors.push(bottom);
		}
		if (left && !left.visited) {
			neighbors.push(left);
		}
	
		if (neighbors.length > 0) {
			var r = Math.floor( this.stage.seededrandom() * neighbors.length);
            return neighbors[r];
		} else {
			return undefined;
		}
		
		
	}
	
}

//------------------------------------------------------
export class Stage  {
    public cellSize = 16
    public grid: Cell[] = [];
    public cols = 40;
    public rows = 40;

    public wall_thickness = 5;
    public wall_length = 16;
    public wall_height = 5;

    public current: any;
    public stack: any[] = [];
    
    public floor_length = 8;
    public randomseed = 1;
    
    public prev_parcel_x: number | null = null;
    public prev_parcel_z: number | null = null;

    public walls: EntityStatus[]        = [];
    public floors: EntityStatus[]       = [];
    public ceilings: EntityStatus[]     = [];
    public lightings: EntityStatus[]    = [];
    public pillars: EntityStatus[]      = [];
    public trees: EntityStatus[]      = [];
    public active_angels: EntityStatus[] = []

    public show_range = 1;
    public parcel_rendered = ( this.show_range * 2 + 2 ) * ( this.show_range * 2 + 1 )  ;
    
    

    public gravestones: Entity[] = []


    //-------------------
    constructor() {
        
        this.generate_maze();
        this.generate_interior_type();

        this.create_wall_instances();
         this.create_floor_instances();
        
        this.create_pillar_instances();
        this.create_tree_instances()
        
        

        

        this.gravestones = [
            engine.addEntity(),
            engine.addEntity(),
            engine.addEntity(),
            engine.addEntity()
        ]

        // Each created once at startup
        for (const g of this.gravestones) {
            GltfContainer.create(g, { src: 'models/tomb' + (1 + Math.floor(Math.random() * 4)) + '.glb' })
            Transform.createOrReplace(g, { position: Vector3.create(0, -999, 0) }) // hidden
        }


        this.init_bgm();
       
    }

    //----------
    set_parcel_within_range_reveal( val: number ) {

        //log("----------");

        for ( let i = (this.prev_parcel_z ?? 0) - this.show_range ; i <= (this.prev_parcel_z ?? 0) + this.show_range ; i++ ) {
            for ( let j = (this.prev_parcel_x ?? 0) - this.show_range ; j <= (this.prev_parcel_x ?? 0) + this.show_range ; j++ ) {
                
                let grid_x = ( j + this.cols / 2 );
                let grid_z = ( i + this.rows / 2 );
                if ( grid_x >= 0 && grid_z >= 0 && grid_x < this.cols && grid_z < this.rows ) {
                    
                    let parcel:Cell = this.grid[grid_z * this.rows + grid_x ];
                    if ( val == 1 ) {
                        if ( parcel.reveal == 2 ) {
                            parcel.reveal = 3;
                        } else {
                            parcel.reveal = 1;
                        }
                    } else {
                        
                        parcel.reveal = val;
                    }
                    //log("Setting", parcel.x, parcel.y , parcel.reveal);
                }
            }
        }
    }


    //---------------
    init_bgm( ) {
	 
      
        AudioSource.getMutable(heart).playing = true
        AudioSource.getMutable(heart).loop = true

      
        AudioSource.getMutable(wind).playing = true
        AudioSource.getMutable(wind).loop = true

    }

    
    

    //-------------
    create_wall_instances() {

        for ( let i = 0 ; i < this.parcel_rendered * 4  ; i++ ) {
            let w = this.create_wall_entity( 8, -5 ,8, this.wall_length , this.wall_height , this.wall_thickness );
            w.used  = false;
            this.walls.push( w );
        }
    }

    //-------------
    create_floor_instances() {

        for ( let i = 0 ; i < this.parcel_rendered * 8  ; i++ ) {
            let fl = this.create_floor_entity( 0, -5 ,0, this.floor_length , this.floor_length , 1 );
            fl.used = false;
            this.floors.push( fl );
        }
    }


    //------------
    create_pillar_instances() {

        for ( let i = 0 ; i < 12 ; i++ ) {  // Increased from 4 to 12 for more angels
            let fl = this.create_pillar_entity( 0, -15 , 0, 4, 4, 4 );
            fl.used = false;
            this.pillars.push( fl );
        }
        
    }

    //------------
    create_tree_instances() {

        for ( let i = 0 ; i < 20 ; i++ ) {
            let fl = this.create_tree_entity( 0, 0 ,0, 0 , this.wall_height , 0 );
            fl.used = false;
            this.trees.push( fl );
        }
        
    }
    


    //--------------
    reuse_entities() {

        
        for ( let i = 0 ; i < this.grid.length ; i++) {
            
            let parcel:Cell = this.grid[i];
            
            // 1: Parcel is newly revealed. 
            // 2: Parcel is no longer revealed, pls remove entites.
            // 3: Parcel already revealed previously. Do nothing
            
            if ( parcel.reveal == 1 ) {

                //log( "Revealing", parcel.x, parcel.y);

                let base_x  = parcel.x * 16 - this.cols / 2 * 16;;
                let base_y  = this.wall_height / 2;
                let base_z  = parcel.y * 16 - this.rows / 2 * 16;;
                
                let x,y,z,sx,sy,sz,ent;

                y = base_y;
                sx = this.wall_length;
                sy = this.wall_height;
                sz = this.wall_thickness;

                //Bottom wall
                if ( parcel.walls[0] == true ) {  //bottom

                    if ( parcel.y == 0 ) { 
                        
                        x  = base_x + this.wall_length /2;
                        z  = base_z + this.wall_thickness /2;
                        sx = this.wall_length;
                        sz = this.wall_thickness;
                        let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                        if ( w ) {
                            Transform.getMutable(w.entity).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                          
                        }
                    }
                }


                // Right wall
                if ( parcel.walls[1] == true ) { //right
                    x  = base_x + this.wall_length - this.wall_thickness / 2;
                    z  = base_z + this.wall_length /2;
                    
                    sx = this.wall_length;
                    sz = this.wall_thickness;
                    let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                    if ( w ) {
                        Transform.getMutable(w.entity).rotation = Quaternion.fromEulerDegrees(0, 90, 0)
                       
                    }
                }


                // Top wall
                if ( parcel.walls[2] == true ) { //top

                    x  = base_x + this.wall_length/2;
                    z  = base_z + this.wall_length - this.wall_thickness/2;
                    sx = this.wall_length;
                    sz = this.wall_thickness;
                    let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                    if ( w ) {
                        Transform.getMutable(w.entity).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                    }
                }

                // Left wall
                if ( parcel.walls[3] == true ) { //left

                    if ( parcel.x == 0 ) { 
                        x  = base_x + this.wall_thickness/2;
                        z  = base_z + this.wall_length/2;
                        sx = this.wall_length;
                        sz = this.wall_thickness;
                        let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                        if ( w ) {
                            Transform.getMutable(w.entity).rotation = Quaternion.fromEulerDegrees(0, 90, 0)
                        }
                    }
                }


                // Floors
                for ( let j = 0 ; j < 4 ; j++ ) {

                    let flx = j % 2;
                    let flz = (j / 2) >> 0;
                
                    x = base_x + this.floor_length/2 + flx * this.floor_length;
                    z = base_z + this.floor_length/2 + flz * this.floor_length;
                    sx = this.floor_length;
                    sz = this.floor_length;

                    
                    this.reuse_floor_entity( x, 0 , z, sx, sz,  1 , parcel) ;
                }

                x = base_x + 8;
                z = base_z + 8;
                sx = 16;
                sz = 16;

              
                
                // Pillars
                if ( parcel.type == 1 ) {
                    
                    x  = base_x + 10;
                    z  = base_z + 10;
                    sx = 1;
                    sz = 1;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                } else if ( parcel.type == 2 || parcel.type == 3 ) {

                    sx = 1;
                    sz = 1;

                    x  = base_x + 4;
                    y  = base_y;
                    z  = base_z + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
                    x  = base_x + 12;
                    z  = base_z + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
                    x  = base_x + 4;
                    z  = base_z + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
                    x  = base_x + 12;
                    z  = base_z + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);

                } else if ( parcel.type == 4 ) {

                    sx = 4;
                    sz = 4;
                    x  = base_x + 8;
                    y  = base_y;
                    z  = base_z + 8;
                    
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                } else if ( parcel.type == 5 ) {
        
                    sx = 6;
                    sz = 6;
                    x  = base_x + 8;
                    y  = base_y;
                    z  = base_z + 8;
                    
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);


                } else if ( parcel.type == 211 ) {

                    sz = 10;
                    sx = 0.3;
                    z  = base_z + 5;
                    y  = base_y;
                    x  = base_x + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                    sz = 10;
                    sx = 0.3;
                    z  = base_z + 11;
                    y  = base_y;
                    x  = base_x + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
        
                } else if ( parcel.type == 312 ) {
        
                    sx = 10;
                    sz = 0.3;
                    x  = base_x + 5;
                    y  = base_y;
                    z  = base_z + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                    sx = 10;
                    sz = 0.3;
                    x  = base_x + 11;
                    y  = base_y;
                    z  = base_z + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                
                } else if ( parcel.type == 8 ) {
                    
                    sx = 1;
                    sy = 1;
                    sz = 1;
                    x = base_x + 8;
                    z = base_z + 8;
                    y = 0;
                    let avt = this.reuse_tree_entity( x,y,z, sx,sy,sz, parcel );
                    if ( avt ) {
                        Transform.getMutable(avt.entity).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                    }
                }

            }  else if ( parcel.reveal == 2 ) {

                //log( "Clearing", parcel.x, parcel.y);
                
                for ( let j = 0 ; j < parcel.wall_ents.length ; j++ ) {
                    parcel.wall_ents[j].used = false;
                }
                parcel.wall_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.floor_ents.length ; j++ ) {
                    parcel.floor_ents[j].used = false;
                }
                parcel.floor_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.ceiling_ents.length ; j++ ) {
                    parcel.ceiling_ents[j].used = false;
                }
                parcel.ceiling_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.lighting_ents.length ; j++ ) {
                    parcel.lighting_ents[j].used = false;
                }
                parcel.lighting_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.pillar_ents.length ; j++ ) {
                    parcel.pillar_ents[j].used = false;
                }
                parcel.pillar_ents.length = 0;

                for ( let j = 0 ; j < parcel.tree_ents.length ; j++ ) {
                    parcel.tree_ents[j].used = false;
                }
                parcel.tree_ents.length = 0;    



                parcel.reveal = 0;
                
                
            } else if ( parcel.reveal == 3 ) {

                //log("Do nothing on", parcel.x , parcel.y);
                

            }
        }
    }


    //----------
    
    reuse_wall_entity( x: number ,y: number,z: number, sx: number,sy: number,sz: number, parcel:Cell ): EntityStatus|null {
        
        let ent = null;
        for ( let i = 0 ; i < this.walls.length ; i++ ) {
            if ( this.walls[i].used == false ) {
                ent = this.walls[i];
                ent.used = true;
                break;
            }
        }

        if ( ent != null ) {
            const mutableEntity = Transform.getMutable(ent.entity);
            mutableEntity.position.x = x;
            mutableEntity.position.y = y;
            mutableEntity.position.z = z;
            mutableEntity.scale.x = sx;
            mutableEntity.scale.y = sy;
            mutableEntity.scale.z = sz;

            parcel.wall_ents.push( ent );
        } else {
            console.log("not enough entity for wall", this.walls.length)
        }
        return ent;
    }


    //------
    reuse_floor_entity( x: number ,y: number,z: number, sx: number,sy: number,sz: number, parcel:Cell ): EntityStatus | null {
        
        let ent = null;
        for ( let i = 0 ; i < this.floors.length ; i++ ) {
            if ( this.floors[i].used == false ) {
                ent = this.floors[i];
                ent.used = true;
                break;
            }
        }

        if ( ent != null ) {
            const mutableEntity = Transform.getMutable(ent.entity);
            mutableEntity.position.x = x;
            mutableEntity.position.y = y;
            mutableEntity.position.z = z;
            mutableEntity.scale.x = sx;
            mutableEntity.scale.y = sy;
            mutableEntity.scale.z = sz;
            
            parcel.floor_ents.push( ent );
        } else {
            console.log("not enough entity for floor", this.floors.length)
        }
        return ent;
    }


    //-------
    reuse_pillar_entity( x: number ,y: number,z: number, sx: number,sy: number,sz: number, parcel:Cell ): EntityStatus | null {
        
        let ent = null;
        for ( let i = 0 ; i < this.pillars.length ; i++ ) {
            if ( this.pillars[i].used == false ) {
                ent = this.pillars[i];
                ent.used = true;
                break;
            }
        }

        if ( ent != null ) {
        
            const mutableEntity = Transform.getMutable(ent.entity);
            mutableEntity.position.x = x;
            mutableEntity.position.y = 1.8;
            mutableEntity.position.z = z;
            mutableEntity.scale.x = 2;
            mutableEntity.scale.y = 2;
            mutableEntity.scale.z = 2;
            parcel.pillar_ents.push( ent );

        } else {
            console.log("not enough entity for pillar", this.pillars.length)
        }
        return ent;
    }

    //-------
    reuse_tree_entity(
        x: number,
        y: number,
        z: number,
        sx: number,
        sy: number,
        sz: number,
        parcel: Cell
        ): EntityStatus | null {
        let ent: EntityStatus | null = null

        // find unused tree
        for (let i = 0; i < this.trees.length; i++) {
            if (!this.trees[i].used) {
            ent = this.trees[i]
            ent.used = true
            break
            }
        }

        if (ent != null) {
            // update tree transform
            const tree = Transform.getMutable(ent.entity)
            tree.position.x = x
            tree.position.y = 5.5
            tree.position.z = z
            tree.scale.x = 6
            tree.scale.y = 6
            tree.scale.z = 6

            parcel.tree_ents.push(ent)

            // --- GRAVESTONES ---

            // random count (2–4)
            const numToShow = 2 + Math.floor(Math.random() * 3)

            for (let i = 0; i < this.gravestones.length; i++) {
            const g = this.gravestones[i]
            const gt = Transform.getMutable(g)

            if (i < numToShow) {
                // random position near base
                const offsetX = (Math.random() - 0.5) * 11
                const offsetZ = (Math.random() - 0.5) * 13
                const randomRot = Quaternion.fromEulerDegrees(0, Math.random() * 360, 0)
                const randomScale = 0.8 + Math.random() * 3.4

                gt.position.x = x + offsetX
                gt.position.y = 1
                gt.position.z = z + offsetZ
                gt.rotation = randomRot
                //gt.scale = Vector3.create(randomScale, randomScale, randomScale)
            } else {
                // hide unused ones below ground
                gt.position.y = -999
            }
            }
        } else {
            console.log('not enough entities for tree', this.trees.length)
        }

        return ent
        }


    //------------------------------------
    create_floor_entity( x: number ,y: number,z: number, sx: number,sy: number,sz: number): EntityStatus {
        
        // Floor
        let f = engine.addEntity()
        MeshRenderer.createOrReplace(f, {
            mesh: {
                $case: 'plane',
                plane: { uvs: [ 0,0, 0,1, 1,1, 1,0] },
            },
        })
        MeshCollider.setPlane(f)
        Material.setPbrMaterial(f, {
            texture: Material.Texture.Common({
                src: 'images/floor.png',
            }),
            specularIntensity: 0,
            roughness: 1
        })

        Transform.createOrReplace(f, {
            position: Vector3.create(x , y,  z),
            scale: Vector3.create(sx,  sy , sz),
            rotation:  Quaternion.fromEulerDegrees(-90,0,0)
        })
        return { used: false, entity: f};
    }

   

    //------
    create_wall_entity( x: number ,y: number,z: number, sx: number,sy: number,sz: number): EntityStatus {
        let w = this.create_wall_entity_box(x,y,z,sx,sy,sz);
        return { used: false, entity: w}
    }

    //---------
    create_wall_entity_box( x: number ,y: number,z: number, sx: number,sy: number,sz: number) {

        let w = engine.addEntity()
        GltfContainer.createOrReplace(w, {
            src: WALL_MODEL_PATH,
            visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        })

        Transform.createOrReplace(w, {
            position: Vector3.create(x,y,z),
            scale: Vector3.create(1,1,1)
        })

        
        return w;
    }

    //----
    create_wall_entity_plane( x: number, y: number, z: number, sx: number, sy: number, sz: number) : Entity {
        let w = engine.addEntity()
       GltfContainer.createOrReplace(w, {
            src: 'models/fence.glb',
            
        })

        Transform.createOrReplace(w, {
            position: Vector3.create(x, y, z),
            scale: Vector3.create(1,1,1)
        })

        return w;
    }

    //---------
    create_pillar_entity( x: number ,y: number,z: number, sx: number,sy: number,sz: number) : EntityStatus {
        let w = engine.addEntity();
        GltfContainer.createOrReplace(w, {
            src: 'models/weep.glb',
            visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
        })

        Transform.createOrReplace(w, {
            position: Vector3.create(x, 1.8, z),
            scale: Vector3.create(2, 2, 2),
            rotation: Quaternion.fromEulerDegrees(0, Math.random() * 360, 0)
        })

        TriggerArea.setBox(w)
        triggerAreaEventsSystem.onTriggerEnter(w, () => {
            
             

            if(gameOver || !activateAngels) return;
            //GltfContainer.createOrReplace(w, { src: 'models/close.glb' });
            setGameOver()
            InputModifier.createOrReplace(engine.PlayerEntity, {
                    mode: InputModifier.Mode.Standard({
                        disableAll: true,
                    }),
                })
                
                triggerSceneEmote({ src: 'animations/statue_emote.glb', loop: false }) 
                
                // Cinematic pan using VirtualCamera/MainCamera
                cinematicCameraPan(this)

                utils.timers.setTimeout(()=> {
                    triggerSceneEmote({ src: 'animations/statuestill_emote.glb', loop: true }) 
                }, 8000)
                
               
        });
        

        return { used: false, entity: w};
    }

   //----
    create_tree_entity(x: number, y: number, z: number, sx: number, sy: number, sz: number): EntityStatus {
        const b = engine.addEntity()

        Transform.createOrReplace(b, {
        position: Vector3.create(x, 5.5, z),
        scale: Vector3.create(6, 6, 6)
        })

        GltfContainer.create(b, {
            src: 'models/tree.glb',
            visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
        })

        // random count (2–4)
        const numToShow = 2 + Math.floor(Math.random() * 4)

        for (let i = 0; i < this.gravestones.length; i++) {
            const g = this.gravestones[i]
            const gt = Transform.getMutable(g)

            if (i < numToShow) {
                // random position near base
                const offsetX = (Math.random() - 0.5) * 13
                const offsetZ = (Math.random() - 0.5) * 13
                const randomRot = Quaternion.fromEulerDegrees(0, Math.random() * 360, 0)
                const randomScale = 0.8 + Math.random() * 3.4

                gt.position.x = x + offsetX
                gt.position.y = 1
                gt.position.z = z + offsetZ
                gt.rotation = randomRot
              //  gt.scale = Vector3.create(randomScale, randomScale, randomScale)
            } else {
                // hide unused ones below ground
                gt.position.y = -999
            }
        }
        
        const status: EntityStatus = { used: false, entity: b }
        this.trees.push(status)
        return status
    }


    //---------------------------
    generate_maze() {

        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                let cell = new Cell( this, i, j);
                this.grid.push(cell);
            }
        }
        this.current = this.grid[0];
        for ( let i = 0 ; i < 10000 ; i++) {
            this.generate_maze_step();
            if ( this.current == this.grid[0] ) {
                break;
            };
        }
    }



    //------------------
    generate_maze_step() {
        
        this.current.visited = true;
        //current.highlight();
        // STEP 1
        
        let next:Cell = this.current.checkNeighbors();
        
        if (next) {
            
            next.visited = true;
            // STEP 2
            this.stack.push( this.current);

            // STEP 3
            this.generate_maze_step_removeWalls( this.current, next);

            // STEP 4
            this.current = next;
        } else if ( this.stack.length > 0) {
            this.current = this.stack.pop();
        }
    }


    //---------------------------
    generate_maze_step_removeWalls(a:Cell, b:Cell) {
        
        var x = a.x - b.x;
        if (x === 1) {
            a.walls[3] = false;
            b.walls[1] = false;
        } else if (x === -1) {
            a.walls[1] = false;
            b.walls[3] = false;
        }
        var y = a.y - b.y;
        if (y === 1) {
            a.walls[0] = false;
            b.walls[2] = false;
        } else if (y === -1) {
            a.walls[2] = false;
            b.walls[0] = false;
        }
    }

    //---------
    generate_interior_type() {

        for ( let i = 0 ; i < this.grid.length ; i++ ) {
            let parcel:Cell = this.grid[i];

            parcel.type = Math.floor( this.seededrandom() * 10 );
            
            // Starting point no need clutter
            if ( parcel.x >= 9 && parcel.x <= 10 && parcel.y >= 9 && parcel.y <= 10 ) { 
                parcel.type = 0;
            }

            if ( parcel.walls[0] == false && parcel.walls[2] == false ) {
                parcel.type = 12;     
            }
            if ( parcel.walls[1] == false && parcel.walls[3] == false ) {
                parcel.type = 11;     
            }
            
            // Ensure trees (type 8) don't conflict with pillars
            // If parcel has type 8 (tree), make sure it's not near starting area
            if (parcel.type == 8) {
                const distanceFromStart = Math.sqrt((parcel.x - 9.5) * (parcel.x - 9.5) + (parcel.y - 9.5) * (parcel.y - 9.5))
                if (distanceFromStart < 5) {
                    // Too close to start, change to a different type
                    parcel.type = Math.floor( this.seededrandom() * 7 ) + 1; // 1-7 instead of 8
                }
            }
            
        }       
    }



    //---------------------------
    cell_index_by_coord(i: number, j: number) {
        if (i < 0 || j < 0 || i > this.cols - 1 || j > this.rows - 1) {
        return -1;
        }
        return i + j * this.cols;
    }

    
    //------------
    seededrandom() {
        var x = Math.sin(this.randomseed++) * 10000;
        return x - Math.floor(x);
    }


    //-----------
    init_inputs() {
        
    }
    

}


function facePlayer(entity: Entity, playerPos: Vector3) {
    if (!Transform.has(entity)) return;

    const entTransform = Transform.getMutable(entity)
    const entPos = entTransform.position

    // direction vector to player
    const dir = Vector3.subtract(playerPos, entPos)
    dir.y = 0 // only rotate horizontally

    if (Vector3.length(dir) === 0) return

    const lookAtTarget = Vector3.create(playerPos.x, entPos.y, playerPos.z)
    const lookAtDirection = Vector3.subtract(lookAtTarget, entPos)
     entTransform.rotation = Quaternion.slerp(
        entTransform.rotation,
        Quaternion.lookRotation(lookAtDirection),
        1
      )
      
}


let prevStatus = activateAngels
let prevGameOver = gameOver



export function cinematicCameraPan(stage: Stage) {
    if (!Transform.has(engine.PlayerEntity)) return

    const playerTransform = Transform.get(engine.PlayerEntity)
    const cinematicCamera = engine.addEntity()
    const playerPos = Vector3.create(playerTransform.position.x, playerTransform.position.y, playerTransform.position.z)
    const up = Vector3.create(0, 1, 0)

    // Start: close to the player at eye level (y = 1)
    const startPos = Vector3.add(playerPos, Vector3.create(0, 2, -4)) // 2 units in front of player
    // End: slightly back and higher (y = 5)
    const endPos = Vector3.add(playerPos, Vector3.create(0, 7, -6)) // 6 units back, 5 units up

    Transform.createOrReplace(cinematicCamera, {
        position: startPos,
        rotation: Quaternion.lookRotation(Vector3.subtract(playerPos, startPos), up)
    })
    
    VirtualCamera.create(cinematicCamera, {})

    const mainCamera = MainCamera.createOrReplace(engine.CameraEntity, {
        virtualCameraEntity: cinematicCamera,
    })

    // Move camera from startPos to endPos over 3 seconds
    utils.tweens.startTranslation(
        cinematicCamera,
        startPos,
        endPos,
        5.0,
        utils.InterpolationType.EASEINQUAD,
        () => {
            // Look slightly down at player after reaching endPos
            const finalRotation = Quaternion.lookRotation(Vector3.subtract(playerPos, endPos), up)
            utils.tweens.startRotation(
                cinematicCamera,
                Transform.get(cinematicCamera).rotation,
                finalRotation,
                5.0,
                utils.InterpolationType.EASEOUTQUAD,
                () => {
                    // Hold for 1 second then revert to main camera and cleanup stage
                    utils.timers.setTimeout(() => {
                        const mainCamera = MainCamera.getMutable(engine.CameraEntity)
                        mainCamera.virtualCameraEntity = undefined

                        
                        
                        // Clean up stage and reset scene (with proper sequencing)
                           
                        resetSceneToNewState(stage, cinematicCamera)
                        

                        InputModifier.createOrReplace(engine.PlayerEntity, {
                            mode: InputModifier.Mode.Standard({
                                disableAll: false,
                            }),
                        })
                    }, 1000)
                }
            )
        }
    )
}


export function angelSystem(stage: Stage) {
    return (dt: number) => {
        if (!Transform.has(engine.PlayerEntity)) return
        
        // Don't run angel system until game starts
        if (!isGameStarted()) return

        // On game over transition: force all angels back to weep and clear active list
        if (gameOver && !prevGameOver) {
            for (const pillar of stage.pillars) {
                const p = pillar as EntityStatus
                GltfContainer.createOrReplace(p.entity, { src: 'models/weep.glb' })
            }
            stage.active_angels.length = 0
        }
        prevGameOver = gameOver
        if (gameOver) return

        // Cache player transform and update follow light
        const playerT = Transform.get(engine.PlayerEntity)
        const playerPos = playerT.position
        const mutableLight = Transform.getMutable(foglight)
        mutableLight.position = Vector3.create(playerPos.x + 5, 18, playerPos.z)

        // Precompute player's forward (rotate -Z by quaternion)
        const q = playerT.rotation
        const fx = -2 * (q.x * q.z + q.w * q.y)
        const fz = -(1 - 2 * (q.x * q.x + q.y * q.y))
        const fLen = Math.hypot(fx, fz)
        const fwdX = fLen > 0.0001 ? fx / fLen : 0
        const fwdZ = fLen > 0.0001 ? fz / fLen : -1

        // React to candle state changes only when the flag flips
        if (prevStatus !== activateAngels) {
            prevStatus = activateAngels

            for (const pillar of stage.pillars) {
                const p = pillar as EntityStatus
                if (activateAngels) {
                    if (!stage.active_angels.includes(p)) {
                        GltfContainer.createOrReplace(p.entity, { src: 'models/move.glb' })
                        stage.active_angels.push(p)
                    }
                } else {
                    if (stage.active_angels.includes(p)) {
                        GltfContainer.createOrReplace(p.entity, { src: 'models/weep.glb' })
                        const index = stage.active_angels.indexOf(p)
                        if (index !== -1) stage.active_angels.splice(index, 1)
                    } else {
                        GltfContainer.createOrReplace(p.entity, { src: 'models/weep.glb' })
                    }
                }
            }
        }

        // If angels disabled, nothing to move
        if (!activateAngels) return

        // Move all active angels toward the player (no visibility gating)
        for (const angel of stage.active_angels) {

            const angelTransform = Transform.getMutable(angel.entity)
            const angelPos = angelTransform.position

            const dx = playerPos.x - angelPos.x
            const dz = playerPos.z - angelPos.z
            const lenSq = dx * dx + dz * dz

            // Proximity swap to final.glb removed per request
            if (lenSq > 0.0001) {
                const invLen = 1 / Math.sqrt(lenSq)
                const speed = 2 * dt
                angelPos.x += dx * invLen * speed
                angelPos.z += dz * invLen * speed
            }

            facePlayer(angel.entity, playerPos)
        }
    }
}

export function stageUpdateSystem(stage: Stage) {

    return () => {
        if (!Transform.has(engine.PlayerEntity)) return
        
        // Don't run stage system until game starts
        if (!isGameStarted()) return

        let cur_parcel_x, cur_parcel_z;
        const playerPosition =  Transform.get(engine.PlayerEntity).position
        //const focusPos = getStageFocusPosition()


        if ( playerPosition.x >= 0 ) {
            cur_parcel_x = (playerPosition.x / 16 ) >> 0;
        } else {
            cur_parcel_x = ((playerPosition.x - 16)/ 16 ) >> 0;
        }

        if ( playerPosition.z >= 0 ) {
            cur_parcel_z = (playerPosition.z / 16 ) >> 0;
        } else {
            cur_parcel_z = ((playerPosition.z - 16)/ 16 ) >> 0;
        }


        if ( cur_parcel_x != stage.prev_parcel_x  || cur_parcel_z != stage.prev_parcel_z ) {

            if ( stage.prev_parcel_x != null && stage.prev_parcel_z != null ) {
                stage.set_parcel_within_range_reveal( 2 );
            }
            stage.prev_parcel_x = cur_parcel_x;
            stage.prev_parcel_z = cur_parcel_z;
            stage.set_parcel_within_range_reveal( 1 );
            stage.reuse_entities();

        }
        
        


        LightSource.getMutable(foglight).active = activateAngels

    }
}

// Global reference to stage systems for cleanup
export let stageSystems: ((() => void) | ((dt: number) => void))[] = []

export async function cleanupStage(stage: Stage) {
    console.log("Cleaning up stage and all entities...")
     
    // 1. Remove all stage systems
    for (const system of stageSystems) {
        try {
            engine.removeSystem(system)
        } catch (e) {
            // System might not exist
        }
    }
    stageSystems.length = 0

    // Remove all wall entities
    for (const wall of stage.walls) {
        if (wall.entity) {
            try {
                engine.removeEntity(wall.entity)
            } catch (e) {
                // Entity might already be removed
            }
        }
    }
    stage.walls.length = 0
    
    // Remove all floor entities
    for (const floor of stage.floors) {
        if (floor.entity) {
            try {
                engine.removeEntity(floor.entity)
            } catch (e) {
                // Entity might already be removed
            }
        }
    }
    stage.floors.length = 0
    
    // Remove all pillar entities
    for (const pillar of stage.pillars) {
        if (pillar.entity) {
            try {
                engine.removeEntity(pillar.entity)
            } catch (e) {
                // Entity might already be removed
            }
        }
    }
    stage.pillars.length = 0
    
    // Remove all tree entities
    for (const tree of stage.trees) {
        if (tree.entity) {
            try {
                engine.removeEntity(tree.entity)
            } catch (e) {
                // Entity might already be removed
            }
        }
    }
    stage.trees.length = 0
    
    // Remove all gravestone entities
    for (const gravestone of stage.gravestones) {
        if (gravestone) {
            try {
                engine.removeEntity(gravestone)
            } catch (e) {
                // Entity might already be removed
            }
        }
    }
    stage.gravestones.length = 0
    
    // Keep darkness sphere - don't remove it
    // stage.darkness_sphere stays active
    
    // Clear active angels
    stage.active_angels.length = 0
    
    // Stop background music
    if (heart && AudioSource.has(heart)) {
        AudioSource.getMutable(heart).playing = false
    }
    if (wind && AudioSource.has(wind)) {
        AudioSource.getMutable(wind).playing = false
    }
    
    
    console.log("Stage cleanup completed")
}

export function resetSceneToNewState(stage: Stage,  cinematicCamera: any) {
    console.log("Resetting scene to new state...")
    
    // Use UI fade transition
    fadeTransition(() => {
        // Import and create the gr
        // im reaper boat scene
        VirtualCamera.deleteFrom(cinematicCamera)
     engine.removeEntity(cinematicCamera)
        cleanupStage(stage)
        import('./stage2').then((stage2) => {
            stage2.createGrimReaperBoatScene()
        })
    })
}

export function SetStage1Scene(){
    try {

        const stage = new Stage()
        console.log("Stage created successfully")
        
        const stageUpdateSys = stageUpdateSystem(stage)
        console.log("stageUpdateSystem created")
        
        const angelSys = angelSystem(stage)
        console.log("angelSystem created")
        
        engine.addSystem(stageUpdateSys)
        engine.addSystem(angelSys)
        console.log("Systems added to engine")
        
        // Track systems for cleanup
        stageSystems.push(stageUpdateSys, angelSys)
        console.log("Systems tracked for cleanup")
        
        const c1 = createCandle(Vector3.create(7, 0.3, 7))
        console.log("First candle created")
       
        
        forceLightCandle(c1)
        console.log("First candle lit")
        
        // register the system
        engine.addSystem(candleSystem())
        stageSystems.push(candleSystem)
        console.log("Candle system added")
        
        console.log("SetStage1Scene completed successfully")
    } catch (error) {
        console.error("Error in SetStage1Scene:", error)
        throw error
    }
}