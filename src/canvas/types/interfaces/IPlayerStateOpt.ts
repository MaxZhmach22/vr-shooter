import type { GripTypes } from '@/canvas/types/enums/grip-types'

export interface IPlayerStateOpt {
  score: number
  alive: boolean
  weapon: GripTypes
  teleport: GripTypes
}
