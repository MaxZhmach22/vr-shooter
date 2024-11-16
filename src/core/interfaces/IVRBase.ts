import { ControllerBuilder } from '@/canvas/vr/ControllerBuilder'
import type { VRInitializer } from '@/canvas/vr/VRInitializer'
import type { PerspectiveCamera, Vector3 } from 'three'

export interface IVRBase {
  button: HTMLElement
  vr: VRInitializer
  camera: PerspectiveCamera
  intersection: { current: Vector3 | undefined }
  controllers: ControllerBuilder
}
