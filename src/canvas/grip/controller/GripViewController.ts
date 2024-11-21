import { inject, injectable } from 'inversify'
import { GAMETYPES } from '@/canvas/types/types'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  RingGeometry,
} from 'three'
import { TeleportGripView } from '@/canvas/grip/view/TeleportGripView'
import { PistolGripView } from '@/canvas/grip/view/PistolGripView'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type { IPistolGripOpt } from '@/canvas/types/interfaces/grip/IPistolGripOpt'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'
import type { IVRController } from '@/core/interfaces/IVRController'

@injectable()
export class GripViewController implements IUpdate, IControllersInit {
  private readonly _gripViews: Map<string, Object3D> = new Map()

  constructor(
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(GAMETYPES.PistolGripOpt) private readonly _pistolGripOpt: IPistolGripOpt,
  ) {}

  public initControllers(mainController: IVRController, teleportController: IVRController) {
    const teleportView = new TeleportGripView(
      new XRControllerModelFactory(),
      teleportController.controllerGrip,
    )
    teleportController.controllerGrip.add(teleportView)

    const line = this.buildController(teleportController.inputSource)
    teleportController.line = line
    teleportController.controller.add(line as Mesh)

    this._gripViews.set('teleport', teleportView)

    const pistolView = new PistolGripView(
      this._threeJsBase.renderer,
      this._vrBase.camera,
      [mainController, teleportController],
      this._pistolGripOpt,
    )
    mainController.controllerGrip.add(pistolView)

    this._gripViews.set('pistol', pistolView)
  }

  private buildController(data: XRInputSource) {
    let geometry
    let material

    switch (data.targetRayMode) {
      case 'tracked-pointer':
        return this.createLine()
      case 'gaze':
        geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
        material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
        return new Mesh(geometry, material)

      default:
        break
    }

    return null
  }

  private createLine(): Line {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
    geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))

    const material = new LineBasicMaterial({
      vertexColors: true,
      blending: AdditiveBlending,
    })

    return new Line(geometry, material)
  }

  public update() {}
}
