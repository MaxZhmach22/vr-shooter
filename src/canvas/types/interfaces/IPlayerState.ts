import type { BaseGripView } from '@/canvas/grip/view/BaseGripView'

export interface IPlayerState {
  score: number
  alive: boolean
  weapon: BaseGripView | null
  teleport: BaseGripView | null
}
