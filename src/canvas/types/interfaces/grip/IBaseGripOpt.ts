import type { Vector3 } from 'three'

export interface IBaseGripOpt {
  visible: boolean
  position: Vector3
  rotation: Vector3
  scale: number
  guiWidth: number
}
