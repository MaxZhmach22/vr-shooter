import type { XRTargetRaySpace } from 'three'
import type { ControllerType } from '@/core/enums/ControllerType'

export interface IVRController {
  controller: XRTargetRaySpace
  controllerGrip: XRTargetRaySpace
  controllerType: ControllerType
  inputSource: XRInputSource
  line: object | null
  userData: {
    isSelecting: boolean
  }
  gamepad: Gamepad | undefined
}
