import { inject, injectable } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { Subject } from 'rxjs'
import type { IVRInputEvent } from '@/core/interfaces/IVRInputEvent'
import { ControllerEventType } from '@/core/enums/ControllerEventType'
import type { IVRController } from '@/core/interfaces/IVRController'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'

@injectable()
export class InputController implements IControllersInit {
  public $inputEvent = new Subject<IVRInputEvent>()

  constructor(
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
    @inject(TYPES.ThreeJsBase) private readonly threeJsBase: IThreeJsBase,
  ) {}

  public initControllers(mainController: IVRController, teleportController: IVRController) {
    mainController.controller.addEventListener('selectstart', () => {
      this.$inputEvent.next({ event: ControllerEventType.SelectStart, controller: mainController })
      mainController.userData.isSelecting = true
    })
    mainController.controller.addEventListener('selectend', () => {
      this.$inputEvent.next({ event: ControllerEventType.SelectEnd, controller: mainController })
      mainController.userData.isSelecting = false
    })

    teleportController.controller.addEventListener('selectstart', () => {
      this.$inputEvent.next({
        event: ControllerEventType.SelectStart,
        controller: teleportController,
      })
      teleportController.userData.isSelecting = true
    })
    teleportController.controller.addEventListener('selectend', () => {
      this.$inputEvent.next({
        event: ControllerEventType.SelectEnd,
        controller: teleportController,
      })
      teleportController.userData.isSelecting = false
    })
  }
}
