import { EventDispatcher } from 'three'
import type { CustomWebXRSpaceEventMap } from '@/canvas/types/interfaces/CustomWebXRSpaceEventMap'

export class CustomEventDispatcher extends EventDispatcher<CustomWebXRSpaceEventMap> {}
