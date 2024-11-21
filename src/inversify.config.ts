import { Container } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from 'three'
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
import type { IWorldPhysicsOpt } from '@/canvas/types/interfaces/IWorldPhysicsOpt'
import type { IGameStateService } from '@/canvas/types/interfaces/IGameStateService'
import { GameStateService } from '@/canvas/state/GameStateService'
import { InputController } from '@/canvas/input/InputController'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
import { ControllerBuilder } from '@/canvas/vr/ControllerBuilder'
import { VRInitializer } from '@/canvas/vr/VRInitializer'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import { VrWinPanel } from '@/canvas/vr/VrWinPanel'
import { CameraController } from '@/canvas/camera/CameraController'
import { SceneController } from '@/canvas/scene/SceneController'
import { PlayerController } from '@/canvas/player/PlayerController'
import { TeleportRaycastController } from '@/canvas/raycast/TeleportRaycastController'
import type { IPlayerOpt } from '@/canvas/types/interfaces/IPlayerOpt'
import type { IOrbitControlsOpt } from '@/canvas/types/interfaces/IOrbitControlsOpt'
import type { IGripOpt } from '@/canvas/types/interfaces/grip/IGripOpt'
import { GripViewController } from '@/canvas/grip/controller/GripViewController'
import type { IPistolGripOpt } from '@/canvas/types/interfaces/grip/IPistolGripOpt'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'

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

  const button = VRButton.createButton(renderer)
  document.body.appendChild(button)

  const vr = new VRInitializer(renderer)

  const vrBase = {
    button: button,
    vr: vr,
    camera: new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 200),
  }

  // Registering the GameSettings
  const playerOpt: IPlayerOpt = gameSettings.playerOpt
  container.bind<IPlayerOpt>(GAMETYPES.PlayerOpt).toConstantValue(playerOpt)
  const orbitControlsOpt: IOrbitControlsOpt = gameSettings.orbitControlsOpt
  container.bind<IOrbitControlsOpt>(GAMETYPES.OrbitControlsOpt).toConstantValue(orbitControlsOpt)
  const gripOpt: IGripOpt = gameSettings.gripOpt
  container.bind<IGripOpt>(GAMETYPES.GripOpt).toConstantValue(gripOpt)

  // Registering the Guns options
  // @ts-expect-error - PistolGripOpt log is not defined
  const pistolOpt: IPistolGripOpt = gameSettings.pistolGripOpt
  container.bind<IPistolGripOpt>(GAMETYPES.PistolGripOpt).toConstantValue(pistolOpt)

  const worldPhysicsOpt: IWorldPhysicsOpt = gameSettings.worldPhysicsOpt
  container.bind<IWorldPhysicsOpt>(GAMETYPES.WorldPhysicsOpt).toConstantValue(worldPhysicsOpt)

  const commonDebugOpt = gameSettings.commonDebugOpt
  container.bind(GAMETYPES.CommonDebugOpt).toConstantValue(commonDebugOpt)

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

  container
    .bind<TeleportRaycastController>(GAMETYPES.RaycastController)
    .to(TeleportRaycastController)
    .inSingletonScope()

  container
    .bind<GripViewController>(GAMETYPES.GripViewController)
    .to(GripViewController)
    .inSingletonScope()

  container
    .bind<ControllerBuilder>(GAMETYPES.ControllerBuilder)
    .to(ControllerBuilder)
    .inSingletonScope()

  container.bind<InputController>(TYPES.InputController).to(InputController).inSingletonScope()

  container.bind<VrWinPanel>(GAMETYPES.VrWinPanel).to(VrWinPanel).inSingletonScope()

  // Registering controllers notifiers
  container.bind<IControllersInit>(TYPES.ControllersInit).toService(GAMETYPES.GripViewController)
  container.bind<IControllersInit>(TYPES.ControllersInit).toService(GAMETYPES.PlayerController)
  container.bind<IControllersInit>(TYPES.ControllersInit).toService(GAMETYPES.RaycastController)
  container.bind<IControllersInit>(TYPES.ControllersInit).toService(TYPES.InputController)

  // Registering classes for UpdatingLoops
  container.bind<IUpdate>(TYPES.Update).toService(TYPES.World)
  container.bind<IUpdate>(TYPES.Update).toService(TYPES.RapierDebugRenderer)
  container.bind<IUpdate>(TYPES.Update).toService(GAMETYPES.VrWinPanel)
  container.bind<IUpdate>(TYPES.Update).toService(GAMETYPES.PlayerController)
  container.bind<IUpdate>(TYPES.Update).toService(GAMETYPES.RaycastController)
  container.bind<IUpdate>(TYPES.Update).toService(GAMETYPES.GripViewController)

  return container
}

export { buildDIContainer }
