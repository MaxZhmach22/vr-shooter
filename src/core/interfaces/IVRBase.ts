import type { VRInitializer } from '@/canvas/vr/VRInitializer'
import type { PerspectiveCamera } from 'three'

export interface IVRBase {
  button: HTMLElement
  vr: VRInitializer
  camera: PerspectiveCamera
}
