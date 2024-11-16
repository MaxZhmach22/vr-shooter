import type { ControllerEventType } from '@/core/enums/ControllerEventType'
import type { IVRController } from '@/core/interfaces/IVRController'

export interface IVRInputEvent {
  controller: IVRController
  event: ControllerEventType
}
