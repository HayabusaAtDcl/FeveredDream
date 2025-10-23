// We define the empty imports so the auto-complete feature works as expected.

import { SetStage1Scene } from './stage'
import { addFog, setLight } from './landscape';
import {  playRandomAmbienceLoop } from './ambience';
import { setupUi } from './ui';
import { createStage3Scene } from './stage3';
import { createStage4Scene } from './stage4';
import { createGrimReaperBoatScene } from './stage2';

export function main() {


    // Initialize UI
    setupUi()

    setLight()
    
    // start playing
    playRandomAmbienceLoop()
    addFog();
    
    //createStage3Scene()
    //return;

    //return;;
    SetStage1Scene()
}