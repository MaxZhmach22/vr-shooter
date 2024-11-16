import type { BaseEvent, WebXRSpaceEventMap } from 'three'
import type { IJoyStickRotation } from '@/canvas/types/interfaces/IJoyStickRotation'

export interface CustomWebXRSpaceEventMap extends WebXRSpaceEventMap {
  joyStickRotation: BaseEvent & { data: IJoyStickRotation }
}
