import { inject, injectable } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { Subject } from 'rxjs'
import type { IVRInputEvent } from '@/core/interfaces/IVRInputEvent'
import { ControllerEventType } from '@/core/enums/ControllerEventType'

@injectable()
export class InputController {
  public $inputEvent = new Subject<IVRInputEvent>()

  constructor(
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
    @inject(TYPES.ThreeJsBase) private readonly threeJsBase: IThreeJsBase,
  ) {
    this.addVRControllerEventListeners = this.addVRControllerEventListeners.bind(this)
    this.removeVRControllerEventListeners = this.removeVRControllerEventListeners.bind(this)
    this.onLeftControllerSelectStart = this.onLeftControllerSelectStart.bind(this)
    this.onRightControllerSelectStart = this.onRightControllerSelectStart.bind(this)
    this.onLeftControllerSelectEnd = this.onLeftControllerSelectEnd.bind(this)
    this.onRightControllerSelectEnd = this.onRightControllerSelectEnd.bind(this)
    this.onLeftControllerSqueezeStart = this.onLeftControllerSqueezeStart.bind(this)
    this.onRightControllerSqueezeStart = this.onRightControllerSqueezeStart.bind(this)
    this.onLeftControllerSqueezeend = this.onLeftControllerSqueezeend.bind(this)
    this.onRightControllerSqueezeend = this.onRightControllerSqueezeend.bind(this)

    this.threeJsBase.renderer.xr.addEventListener(
      'sessionstart',
      this.addVRControllerEventListeners,
    )
    this.threeJsBase.renderer.xr.addEventListener(
      'sessionend',
      this.removeVRControllerEventListeners,
    )
  }

  private addVRControllerEventListeners() {
    const rightController = this.vrBase.controllers.rightController
    const leftController = this.vrBase.controllers.leftController

    rightController.controller.addEventListener('selectstart', this.onRightControllerSelectStart)
    rightController.controller.addEventListener('selectend', this.onRightControllerSelectEnd)
    rightController.controller.addEventListener('squeezeend', this.onRightControllerSqueezeend)
    rightController.controller.addEventListener('squeezestart', this.onRightControllerSqueezeStart)

    leftController.controller.addEventListener('selectstart', this.onLeftControllerSelectStart)
    leftController.controller.addEventListener('selectend', this.onLeftControllerSelectEnd)
    leftController.controller.addEventListener('squeezeend', this.onLeftControllerSqueezeend)
    leftController.controller.addEventListener('squeezestart', this.onLeftControllerSqueezeStart)
  }

  private removeVRControllerEventListeners() {
    const rightController = this.vrBase.controllers.rightController
    const leftController = this.vrBase.controllers.leftController

    rightController.controller.removeEventListener('selectstart', this.onRightControllerSelectStart)
    rightController.controller.removeEventListener('selectend', this.onRightControllerSelectEnd)
    rightController.controller.removeEventListener('squeezeend', this.onRightControllerSqueezeend)
    rightController.controller.removeEventListener(
      'squeezestart',
      this.onRightControllerSqueezeStart,
    )

    leftController.controller.removeEventListener('selectstart', this.onLeftControllerSelectStart)
    leftController.controller.removeEventListener('selectend', this.onLeftControllerSelectEnd)
    leftController.controller.removeEventListener('squeezeend', this.onLeftControllerSqueezeend)
    leftController.controller.removeEventListener('squeezestart', this.onLeftControllerSqueezeStart)
  }

  private onLeftControllerSelectStart() {
    const controller = this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SelectStart, controller: controller })
    controller.userData.isSelecting = true
  }

  private onRightControllerSelectStart() {
    const controller = this.vrBase.controllers.rightController
    this.$inputEvent.next({ event: ControllerEventType.SelectStart, controller })
    controller.userData.isSelecting = true
  }

  private onLeftControllerSelectEnd() {
    const controller = this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SelectEnd, controller })
    controller.userData.isSelecting = false
  }

  private onRightControllerSelectEnd() {
    const controller = this.vrBase.controllers.rightController
    this.$inputEvent.next({ event: ControllerEventType.SelectEnd, controller })
    controller.userData.isSelecting = false
  }

  private onLeftControllerSqueezeStart() {
    const controller = this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SqueezeStart, controller })
  }

  private onRightControllerSqueezeStart() {
    const controller = this.vrBase.controllers.rightController
    this.$inputEvent.next({ event: ControllerEventType.SqueezeStart, controller })
  }

  private onLeftControllerSqueezeend = () => {
    const controller = this.vrBase.controllers.leftController
    this.$inputEvent.next({ event: ControllerEventType.SqueezeEnd, controller })
  }

  private onRightControllerSqueezeend = () => {
    const controller = this.vrBase.controllers.rightController
    this.$inputEvent.next({ event: ControllerEventType.SqueezeEnd, controller })
  }
}
