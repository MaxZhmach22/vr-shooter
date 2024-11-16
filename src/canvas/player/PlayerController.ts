import { inject, injectable } from 'inversify'
import { CapsuleGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { TYPES } from '@/core/types/types'
import type GUI from 'lil-gui'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IUpdate } from '@/core/interfaces/IUpdate'

@injectable()
export class PlayerController extends Group implements IUpdate {
  private readonly _playerMesh: Mesh

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
    @inject(TYPES.GUI) private readonly _gui: GUI,
  ) {
    super()
    this._playerMesh = this.initPlayer()
    this.position.set(0, 0, 0)
    this._threeJsBase.renderer.xr.addEventListener('sessionstart', () => {
      this._playerMesh.visible = false
    })
    this._threeJsBase.renderer.xr.addEventListener('sessionend', () => {
      this._playerMesh.visible = true
    })
  }

  public update() {}

  private initPlayer(): Mesh {
    this.add(this._vrBase.camera)
    this.add(this._vrBase.controllers.leftController.controller)
    this.add(this._vrBase.controllers.leftController.controllerGrip)
    this.add(this._vrBase.controllers.rightController.controller)
    this.add(this._vrBase.controllers.rightController.controllerGrip)

    const capsule = new CapsuleGeometry(0.5, 1.5, 1, 32)
    const meshBasicMaterial = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    const playerMesh = new Mesh(capsule, meshBasicMaterial)
    this._vrBase.camera.add(playerMesh)
    this._threeJsBase.scene.add(this)

    return playerMesh
  }
}
