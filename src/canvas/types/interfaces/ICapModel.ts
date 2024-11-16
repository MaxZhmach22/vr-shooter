import { Material, Object3D } from 'three'

export interface ICapModel {
  startYPosition: number
  count: number
  model: Object3D
  material: Material
  physics: {
    angularDamping: number
    linearDamping: number
    mass: number
    restitution: number
    friction: number
  }
}
