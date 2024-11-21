import { inject, injectable } from 'inversify'
import { CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { TYPES } from '@/core/types/types'
import type GUI from 'lil-gui'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { PlayerMover } from '@/canvas/player/PlayerMover'
import { GAMETYPES } from '@/canvas/types/types'
import type { TeleportRaycastController } from '@/canvas/raycast/TeleportRaycastController'
import type { IPlayerOpt } from '@/canvas/types/interfaces/IPlayerOpt'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'
import type { IVRController } from '@/core/interfaces/IVRController'

@injectable()
export class PlayerController extends Group implements IUpdate, IControllersInit {
  private readonly _playerMesh: Mesh
  private _playerMover: PlayerMover | null = null

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
    @inject(TYPES.GUI) private readonly _gui: GUI,
    @inject(GAMETYPES.TeleportRaycastController)
    private readonly _raycastController: TeleportRaycastController,
    @inject(GAMETYPES.PlayerOpt) private readonly _playerOpt: IPlayerOpt,
  ) {
    super()
    this._playerMesh = this.initPlayer()

    this._threeJsBase.renderer.xr.addEventListener('sessionstart', () => {
      this._playerMesh.visible = false
    })
    this._threeJsBase.renderer.xr.addEventListener('sessionend', () => {
      this._playerMesh.visible = true
    })
  }

  public update() {
    if (!this._playerMover) return
    this._playerMover.update()
  }

  private initPlayer(): Mesh {
    this.add(this._vrBase.camera)

    const capsule = new CapsuleGeometry(0.5, 1.5, 1, 32)
    const meshBasicMaterial = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    const playerMesh = new Mesh(capsule, meshBasicMaterial)
    this._vrBase.camera.add(playerMesh)
    this._threeJsBase.scene.add(this)

    return playerMesh
  }

  public initControllers(mainController: IVRController, teleportController: IVRController) {
    this.add(mainController.controller)
    this.add(mainController.controllerGrip)
    this.add(teleportController.controller)
    this.add(teleportController.controllerGrip)

    this._playerMover = new PlayerMover(
      new Vector3().copy(this._playerOpt.startPosition),
      this._threeJsBase,
      this._vrBase,
      this._raycastController,
      teleportController,
    )

    console.log('Player controllers initialized')
  }
}
