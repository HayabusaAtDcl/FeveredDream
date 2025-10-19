// We define the empty imports so the auto-complete feature works as expected.
import { Color3, Vector3 } from '@dcl/sdk/math'
import { engine, executeTask, LightSource, Transform } from '@dcl/sdk/ecs'

import { angelSystem,  Stage, stageUpdateSystem, cleanupStage, resetSceneToNewState, stageSystems, SetStage1Scene } from './stage'
import { createCandle, candleSystem, forceLightCandle } from './candle'
import { getUserData } from '~system/UserIdentity';
import { addFog, setLight } from './landscape';
import {  playRandomAmbienceLoop } from './ambience';
import { triggerSceneEmote } from '~system/RestrictedActions';
import { setupUi } from './ui';
import * as utils from '@dcl-sdk/utils'

export function main() {
    // Initialize UI
    setupUi()

    // start playing
    playRandomAmbienceLoop()
    addFog();

    SetStage1Scene()
}