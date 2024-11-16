import type { XRTargetRaySpace } from 'three'
import { CustomEventDispatcher } from '@/canvas/types/events/CustomEventDispatcher'
import type { ControllerType } from '@/core/enums/ControllerType'

export interface IVRController {
  controller: XRTargetRaySpace
  controllerGrip: XRTargetRaySpace
  dispatcher: CustomEventDispatcher
  controllerType: ControllerType
  userData: {
    isSelecting: boolean
  }
}
