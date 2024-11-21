import type { IBaseGripOpt } from '@/canvas/types/interfaces/grip/IBaseGripOpt'

export interface ITeleportGripOpt {
  visible: boolean
  baseGripOpt: IBaseGripOpt
  teleport: {
    position: {
      x: number
      y: number
      z: number
    }
    rotation: {
      x: number
      y: number
      z: number
    }
    scale: number
  }
  rayEnabled: number
  log: () => void
}
