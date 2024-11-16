import type { Vector3 } from '@dimforge/rapier3d'

export interface IWorldPhysicsOpt {
  gravity: Vector3
  ccdIterations: number
  timeStep: number
  allowed_linear_error: number
}
