import type { RaycastController } from '@/canvas/raycast/RaycastController'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type { IVRController } from '@/core/interfaces/IVRController'

export class PlayerMover {
  private _currentRotation = new Euler()
  private _currentQuaternion = new Quaternion()
  private _currentPosition = new Vector3()
  private _isRotating = false
  private _teleportController: IVRController

  constructor(
    private readonly _startPosition: Vector3,
    private readonly _threeJsBase: IThreeJsBase,
    private readonly _vr: IVRBase,
    private readonly _rayCastController: RaycastController,
    teleportController: IVRController,
  ) {
    this._teleportController = teleportController
    this.addSubscriptions()
    this.rotatePlayer = this.rotatePlayer.bind(this)

    this._currentPosition.copy(this._startPosition)
    this.movePlayer(this._startPosition, this._currentQuaternion)
  }

  // Update loop
  update() {
    const leftControllerValue = this.checkGamepads(this._teleportController)

    if (leftControllerValue === 0) {
      this._isRotating = false
    }
  }

  private addSubscriptions() {
    this._rayCastController.$floorIntersect.subscribe((event) => {
      this._currentPosition.copy(event)
      this.movePlayer(event, this._currentQuaternion)
    })

    // Debug
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        this.rotatePlayer(1)
      }
      if (event.key === 'ArrowLeft') {
        this.rotatePlayer(-1)
      }
    })
  }

  private movePlayer(position: Vector3, quaternion: Quaternion) {
    if (!this._vr.vr.referenceSpace) return

    const transformedDirection = position.clone().applyQuaternion(quaternion)

    const offsetPosition = {
      x: -transformedDirection.x,
      y: -transformedDirection.y,
      z: -transformedDirection.z,
      w: 1,
    }
    const transform = new XRRigidTransform(offsetPosition, quaternion)
    const teleportSpaceOffset = this._vr.vr.referenceSpace.getOffsetReferenceSpace(transform)
    this._threeJsBase.renderer.xr.setReferenceSpace(teleportSpaceOffset)
  }

  private checkGamepads(controller: IVRController): number {
    if (controller.gamepad === undefined) return -1

    const value = controller.gamepad.axes[2]
    if (Math.abs(value) > 0 && !this._isRotating) {
      this.rotatePlayer(value)
    }

    return value
  }

  private rotatePlayer(axis: number = 0) {
    const rotation = MathUtils.degToRad(axis > 0 ? 45 : -45)
    this._isRotating = true
    this._currentRotation.y += rotation
    this._currentQuaternion.setFromEuler(this._currentRotation)
    this.movePlayer(this._currentPosition, this._currentQuaternion)
  }
}
