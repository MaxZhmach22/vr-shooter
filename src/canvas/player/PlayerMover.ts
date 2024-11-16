import type { RaycastController } from '@/canvas/raycast/RaycastController'
import type { IJoyStickRotation } from '@/canvas/types/interfaces/IJoyStickRotation'
import { Euler, Quaternion, Vector3 } from 'three'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'

export class PlayerMover {
  private _currentRotation = new Euler()

  constructor(
    private readonly _threeJsBase: IThreeJsBase,
    private readonly _vr: IVRBase,
    private readonly _rayCastController: RaycastController,
  ) {
    this._rayCastController.$floorIntersect.subscribe((event) =>
      this.movePlayer(event, new Quaternion()),
    )
  }

  private onJoystickRotation(event: IJoyStickRotation) {
    console.log('onJoystickRotation', event)
    this._currentRotation.y += event.gamepad.axes[2] > 0 ? 45 : -45
    this.movePlayer(new Vector3(), new Quaternion().setFromEuler(this._currentRotation))
  }

  private movePlayer(position: Vector3, quaternion: Quaternion) {
    if (!this._vr.vr.referenceSpace) return

    const offsetPosition = {
      x: -position.x,
      y: -position.y,
      z: -position.z,
      w: 1,
    }
    const transform = new XRRigidTransform(offsetPosition, quaternion)
    const teleportSpaceOffset = this._vr.vr.referenceSpace.getOffsetReferenceSpace(transform)
    this._threeJsBase.renderer.xr.setReferenceSpace(teleportSpaceOffset)
  }
}
