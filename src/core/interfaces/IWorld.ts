import type { World } from '@dimforge/rapier3d'
import { type InstancedMesh, type Matrix4, Object3D } from 'three'
import { RigidBody } from '@dimforge/rapier3d'
import type { ICap } from '@/canvas/types/interfaces/ICap'

export interface IWorld {
  world: World
  addDynamicObject(data: { object: Object3D; rigidBody: RigidBody }): void
  getDynamicObjects(id: number): { object: Object3D; rigidBody: RigidBody }
  addInstancedObject(data: {
    cap: ICap
    mesh: InstancedMesh
    matrix: Matrix4
    rigidBody: RigidBody
  }): void
  getInstancedObject(id: number): {
    cap: ICap
    mesh: InstancedMesh
    matrix: Matrix4
    rigidBody: RigidBody
  }
  getAllInstancedObjects(): Map<
    number,
    { cap: ICap; mesh: InstancedMesh; matrix: Matrix4; rigidBody: RigidBody }
  >
}
