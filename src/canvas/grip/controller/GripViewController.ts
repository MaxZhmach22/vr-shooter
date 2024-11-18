import { inject, injectable } from 'inversify'
import { GAMETYPES } from '@/canvas/types/types'
import type { IGripOpt } from '@/canvas/types/interfaces/IGripOpt'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import type { Object3D } from 'three'
import { TeleportGripView } from '@/canvas/grip/view/TeleportGripView'
import { PistolGripView } from '@/canvas/grip/view/PistolGripView'
import type { IUpdate } from '@/core/interfaces/IUpdate'

@injectable()
export class GripViewController implements IUpdate {
  private readonly _controllerModelFactory: XRControllerModelFactory
  private readonly _gripViews: Map<string, Object3D> = new Map()

  constructor(
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
    @inject(GAMETYPES.GripOpt) private readonly _gripOpt: IGripOpt,
  ) {
    this._controllerModelFactory = new XRControllerModelFactory()

    this.initViews()
  }

  private initViews() {
    const teleportController =
      this._gripOpt.mainHand === 'right'
        ? this._vrBase.controllers.leftController
        : this._vrBase.controllers.rightController

    const mainController =
      this._gripOpt.mainHand === 'right'
        ? this._vrBase.controllers.rightController
        : this._vrBase.controllers.leftController

    const teleportView = new TeleportGripView(
      this._controllerModelFactory,
      teleportController.controllerGrip,
    )
    teleportController.controllerGrip.add(teleportView)

    this._gripViews.set('teleport', teleportView)

    const pistolView = new PistolGripView()
    mainController.controllerGrip.add(pistolView)

    this._gripViews.set('pistol', pistolView)
  }

  public update() {}
}
