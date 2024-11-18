import { Mesh, MeshStandardMaterial, Object3D } from 'three'
import { ModelsResources } from '@/core/managers/models-resources'

export class PistolGripView extends Object3D {
  constructor() {
    super()
    this.init()
  }

  private init() {
    const pistol = ModelsResources.get('pistol')!.scene
    pistol.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshStandardMaterial({ color: 0x222222 })
      }
    })
    pistol.rotation.x = -3.8
    pistol.rotation.z = 3.14
    this.add(pistol)
  }
}
