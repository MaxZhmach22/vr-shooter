import type { RigidBody } from '@dimforge/rapier3d'
import type { CapStates } from '@/canvas/types/enums/capStates'

export interface ICap {
  id: number
  rigidBody: RigidBody
  currentFadingTime: number
  startPosition: number
  state: CapStates
  setStartPosition(index: number): void
  blow(blowForce: number): void
}
