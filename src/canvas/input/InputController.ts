import { inject, injectable } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { Subject } from 'rxjs'
import type { IVRInputEvent } from '@/core/interfaces/IVRInputEvent'
import { ControllerEventType } from '@/core/enums/ControllerEventType'
import type { WebXRSpaceEventMap } from 'three'
import type { IVRController } from '@/core/interfaces/IVRController'

@injectable()
export class InputController {
  public $inputEvent = new Subject<IVRInputEvent>()

  constructor(
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
    @inject(TYPES.ThreeJsBase) private readonly threeJsBase: IThreeJsBase,
  ) {
    this.addVRControllerEventListeners = this.addVRControllerEventListeners.bind(this)
    this.removeVRControllerEventListeners = this.removeVRControllerEventListeners.bind(this)
    this.onSelectStart = this.onSelectStart.bind(this)
    this.onSelectEnd = this.onSelectEnd.bind(this)
    this.onSqueezeStart = this.onSqueezeStart.bind(this)
    this.onSqueezeEnd = this.onSqueezeEnd.bind(this)

    this.onConnected = this.onConnected.bind(this)
    this.onDisconnected = this.onDisconnected.bind(this)

    this.vrBase.controllers.rightController.controller.addEventListener(
      'connected',
      this.onConnected,
    )
    this.vrBase.controllers.leftController.controller.addEventListener(
      'connected',
      this.onConnected,
    )
    this.vrBase.controllers.rightController.controller.addEventListener(
      'disconnected',
      this.onDisconnected,
    )
    this.vrBase.controllers.leftController.controller.addEventListener(
      'disconnected',
      this.onDisconnected,
    )
  }

  private onConnected(event: WebXRSpaceEventMap['connected']) {
    console.log('connected', event.data.handedness)
    switch (event.data.handedness) {
      case 'right':
        this.addVRControllerEventListeners(this.vrBase.controllers.rightController, event)
        break
      case 'left':
        this.addVRControllerEventListeners(this.vrBase.controllers.leftController, event)
        break
      default:
        break
    }
  }

  private onDisconnected(event: WebXRSpaceEventMap['disconnected']) {
    console.log('disconnected', event.data.handedness)
    switch (event.data.handedness) {
      case 'right':
        this.removeVRControllerEventListeners(this.vrBase.controllers.rightController)
        break
      case 'left':
        this.removeVRControllerEventListeners(this.vrBase.controllers.leftController)
        break
      default:
        break
    }
  }

  private addVRControllerEventListeners(
    controller: IVRController,
    event: WebXRSpaceEventMap['connected'],
  ) {
    controller.controller.addEventListener('selectstart', this.onSelectStart)
    controller.controller.addEventListener('selectend', this.onSelectEnd)
    controller.controller.addEventListener('squeezeend', this.onSqueezeEnd)
    controller.controller.addEventListener('squeezestart', this.onSqueezeStart)

    controller.gamepad = event.data.gamepad!
  }

  private removeVRControllerEventListeners(controller: IVRController) {
    controller.controller.removeEventListener('selectstart', this.onSelectStart)
    controller.controller.removeEventListener('selectend', this.onSelectEnd)
    controller.controller.removeEventListener('squeezeend', this.onSqueezeEnd)
    controller.controller.removeEventListener('squeezestart', this.onSqueezeStart)
  }

  private onSelectStart(event: WebXRSpaceEventMap['selectstart']) {
    const controller =
      event.data.handedness === 'left'
        ? this.vrBase.controllers.rightController
        : this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SelectStart, controller: controller })
    controller.userData.isSelecting = true
  }

  private onSelectEnd(event: WebXRSpaceEventMap['selectend']) {
    const controller =
      event.data.handedness === 'left'
        ? this.vrBase.controllers.rightController
        : this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SelectEnd, controller })
    controller.userData.isSelecting = false
  }

  private onSqueezeStart(event: WebXRSpaceEventMap['squeezestart']) {
    const controller =
      event.data.handedness === 'left'
        ? this.vrBase.controllers.rightController
        : this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SqueezeStart, controller })
  }

  private onSqueezeEnd(event: WebXRSpaceEventMap['squeezeend']) {
    const controller =
      event.data.handedness === 'left'
        ? this.vrBase.controllers.rightController
        : this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SqueezeEnd, controller })
  }
}
