import type { Camera } from 'three'

export interface IUpdate {
  update(deltaTime: number, camera?: Camera): void
}
