// We define the empty imports so the auto-complete feature works as expected.

import { SetStage1Scene } from './stage'
import { addFog, setLight } from './landscape';
import {  playRandomAmbienceLoop } from './ambience';
import { setupUi } from './ui';
import { createStage3Scene } from './stage3';
import { createStage4Scene } from './stage4';
import { createGrimReaperBoatScene } from './stage2';
import { engine, Transform, GltfContainer, VideoPlayer, GltfNodeModifiers, Material, MaterialTransparencyMode, Billboard, BillboardMode } from '@dcl/sdk/ecs';
import { Quaternion, Vector3 } from '@dcl/sdk/math';

export function main() {


    // Initialize UI
    setupUi()

    setLight()
    
    // start playing
    playRandomAmbienceLoop()
    addFog();
    
    //createGrimReaperBoatScene()
    //return;

    //return;;
    SetStage1Scene()
}