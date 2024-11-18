import { type Group, Object3D } from 'three'
import type { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'

export class TeleportGripView extends Object3D {
  constructor(
    private readonly _factory: XRControllerModelFactory,
    private readonly _controllerGrip: Group,
  ) {
    super()
    this.init()
  }

  private init() {
    const controllerGrip = this._factory.createControllerModel(this._controllerGrip)
    this.add(controllerGrip)
  }
}
