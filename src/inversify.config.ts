import { Container } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { PerspectiveCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer } from 'three'
import type { IUpdateHandler } from '@/core/interfaces/IUpdateHandler'
import { UpdateHandler } from '@/core/update/UpdateHandler'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { GAMETYPES } from '@/canvas/types/types'
import type { IWorld } from '@/core/interfaces/IWorld'
import { WorldInitializer } from '@/canvas/physics/WorldInitializer'
import { RapierDebugRenderer } from '@/canvas/physics/RapierDebugRenderer'
import GUI from 'lil-gui'
import { IS_PROD } from '@/main'
import gameSettings from '@/assets/config/gameSettings.json'
import type { ICapsPhysicsOpt } from '@/canvas/types/interfaces/ICapsPhysicsOpt'
import type { ITablePhysicsOpt } from '@/canvas/types/interfaces/ITablePhysicsOpt'
import type { IWorldPhysicsOpt } from '@/canvas/types/interfaces/IWorldPhysicsOpt'
import type { IGameStateService } from '@/canvas/types/interfaces/IGameStateService'
import { GameStateService } from '@/canvas/state/GameStateService'
import type { ICapsOpt } from '@/canvas/types/interfaces/ICapsOpt'
import { InputController } from '@/canvas/input/InputController'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
import { ControllerBuilder } from '@/canvas/vr/ControllerBuilder'
import { VRInitializer } from '@/canvas/vr/VRInitializer'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IPostProcessingOpt } from '@/canvas/types/interfaces/IPostProcessingOpt'
import { VrWinPanel } from '@/canvas/vr/VrWinPanel'
import { CameraController } from '@/canvas/camera/CameraController'
import { SceneController } from '@/canvas/scene/SceneController'
import { PlayerController } from '@/canvas/player/PlayerController'

const buildDIContainer = function (renderer: WebGLRenderer): Container {
  const container = new Container()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const base = {
    renderer: renderer,
    camera: new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200),
    scene: new Scene(),
  }

  renderer.xr.enabled = true
  const button = VRButton.createButton(renderer)
  document.body.appendChild(button)

  const vr = new VRInitializer(renderer)
  const vec: Vector3 | undefined = undefined
  const intersection = {
    current: vec,
  }

  const vrBase = {
    button: button,
    vr: vr,
    intersection: intersection,
    camera: new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 200),
    controllers: new ControllerBuilder(renderer, vr, intersection),
  }

  // Registering the GameSettings
  const worldPhysicsOpt: IWorldPhysicsOpt = gameSettings.worldPhysicsOpt
  container.bind<IWorldPhysicsOpt>(GAMETYPES.WorldPhysicsOpt).toConstantValue(worldPhysicsOpt)
  const capsOpt: ICapsOpt = gameSettings.capsOpt
  container.bind<ICapsOpt>(GAMETYPES.CapsOpt).toConstantValue(capsOpt)
  const capsPhysicsOpt: ICapsPhysicsOpt = gameSettings.capsPhysicsOpt
  container.bind<ICapsPhysicsOpt>(GAMETYPES.CapsPhysicsOpt).toConstantValue(capsPhysicsOpt)
  const tablePhysicsOpt: ITablePhysicsOpt = gameSettings.tablePhysicsOpt
  container.bind<ITablePhysicsOpt>(GAMETYPES.TablePhysicsOpt).toConstantValue(tablePhysicsOpt)
  const commonDebugOpt = gameSettings.commonDebugOpt
  container.bind(GAMETYPES.CommonDebugOpt).toConstantValue(commonDebugOpt)

  // @ts-expect-error - PostProcessingOpt is not defined
  const postProcessingOpt: IPostProcessingOpt = gameSettings.postProcessingOpt
  container.bind<IPostProcessingOpt>(GAMETYPES.PostProcessingOpt).toConstantValue(postProcessingOpt)

  const gui = new GUI({ title: 'Debug', width: 300 })

  gui.addFolder('Performance')
  gui.addFolder('Camera')
  gui.addFolder('Physics')
  gui.addFolder('Raycast')
  gui.addFolder('PostProcessing')

  // Registering the GUI
  container.bind<GUI>(TYPES.GUI).toConstantValue(gui)
  if (IS_PROD) gui.hide()

  // Registering the ThreeJsBase
  container.bind<IThreeJsBase>(TYPES.ThreeJsBase).toConstantValue(base)

  // Registering the VRBase
  container.bind<IVRBase>(TYPES.VRBase).toConstantValue(vrBase)

  // Registering the GameStates
  const gameStateService = new GameStateService()
  container.bind<IGameStateService>(GAMETYPES.GameStateService).toConstantValue(gameStateService)

  // Registering the Physics World
  const world = new WorldInitializer(gui, worldPhysicsOpt, gameStateService)
  container.bind<IWorld>(TYPES.World).toConstantValue(world)
  container
    .bind<RapierDebugRenderer>(TYPES.RapierDebugRenderer)
    .toConstantValue(new RapierDebugRenderer(base.scene, world.world, gui, commonDebugOpt))

  // Registering the UpdateHandler
  container.bind<IUpdateHandler>(TYPES.UpdateHandler).to(UpdateHandler)

  container
    .bind<PlayerController>(GAMETYPES.PlayerController)
    .to(PlayerController)
    .inSingletonScope()

  container.bind<SceneController>(GAMETYPES.SceneController).to(SceneController).inSingletonScope()

  container
    .bind<CameraController>(GAMETYPES.CameraController)
    .to(CameraController)
    .inSingletonScope()

  container.bind<InputController>(TYPES.InputController).to(InputController).inSingletonScope()

  container.bind<VrWinPanel>(GAMETYPES.VrWinPanel).to(VrWinPanel).inSingletonScope()

  // Registering classes for UpdatingLoops
  container.bind<IUpdate>(TYPES.Update).toService(TYPES.World)
  container.bind<IUpdate>(TYPES.Update).toService(TYPES.RapierDebugRenderer)
  container.bind<IUpdate>(TYPES.Update).toService(GAMETYPES.VrWinPanel)
  container.bind<IUpdate>(TYPES.Update).toService(GAMETYPES.PlayerController)

  return container
}

export { buildDIContainer }
