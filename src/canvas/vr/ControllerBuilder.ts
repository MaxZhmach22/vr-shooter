import type { IVRController } from '@/core/interfaces/IVRController'
import { ControllerType } from '@/core/enums/ControllerType'
import { inject, multiInject } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type { XRTargetRaySpace } from 'three'
import { GAMETYPES } from '@/canvas/types/types'
import type { IGripOpt } from '@/canvas/types/interfaces/grip/IGripOpt'
import type { IVRBase } from '@/core/interfaces/IVRBase'

export class ControllerBuilder {
  private _leftController: IVRController | null = null
  private _rightController: IVRController | null = null

  constructor(
    @multiInject(TYPES.ControllersInit) private readonly _notifiers: IControllersInit[],
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(GAMETYPES.GripOpt) private readonly _gripOpt: IGripOpt,
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
  ) {
    const firstIndexController = this._threeJsBase.renderer.xr.getController(0)
    firstIndexController.addEventListener('connected', (event) => {
      this.initControllers(event.data, firstIndexController, 0)
    })

    const secondIndexController = this._threeJsBase.renderer.xr.getController(1)
    secondIndexController.addEventListener('connected', (event) => {
      this.initControllers(event.data, secondIndexController, 1)
    })
  }

  private initControllers(
    controller: XRInputSource,
    xrTargetRaySpace: XRTargetRaySpace,
    index: number,
  ) {
    switch (controller.handedness) {
      case 'right':
        this._rightController = {
          controller: xrTargetRaySpace,
          controllerGrip: this._threeJsBase.renderer.xr.getControllerGrip(index),
          controllerType:
            this._gripOpt.mainHand === 'right' ? ControllerType.MainHand : ControllerType.Teleport,
          line: null,
          inputSource: controller,
          userData: {
            isSelecting: false,
          },
          gamepad: controller.gamepad,
        }
        this._rightController.controller.name = 'rightController'
        break
      case 'left':
        this._leftController = {
          controller: xrTargetRaySpace,
          controllerGrip: this._threeJsBase.renderer.xr.getControllerGrip(index),
          controllerType:
            this._gripOpt.mainHand === 'right' ? ControllerType.Teleport : ControllerType.MainHand,
          line: null,
          inputSource: controller,
          userData: {
            isSelecting: false,
          },
          gamepad: controller.gamepad,
        }
        this._leftController.controller.name = 'leftController'
        break
      default:
        break
    }

    if (this._leftController && this._rightController) {
      console.log('Controllers initialized')
      const mainController =
        this._gripOpt.mainHand === 'right' ? this._rightController : this._leftController
      const teleportController =
        this._gripOpt.mainHand === 'right' ? this._leftController : this._rightController
      this._notifiers.forEach((notifier) =>
        notifier.initControllers(mainController, teleportController),
      )
    }
  }
}
