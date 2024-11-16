import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Scene } from 'three'
import type { World } from '@dimforge/rapier3d'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import type GUI from 'lil-gui'
import { findGUIFolder } from '@/core/utils/utils'
import type { ICommonDebugOpt } from '@/canvas/types/interfaces/ICommonDebugOpt'

export class RapierDebugRenderer implements IUpdate {
  mesh
  world
  enabled: boolean

  constructor(scene: Scene, world: World, gui: GUI, commonDebugOpt: ICommonDebugOpt) {
    this.world = world
    this.mesh = new LineSegments(
      new BufferGeometry(),
      new LineBasicMaterial({ color: 0xffffff, vertexColors: true }),
    )
    this.mesh.frustumCulled = false
    scene.add(this.mesh)

    this.enabled = commonDebugOpt.physicsDebug
    const physicsFolder = findGUIFolder(gui, 'Physics')

    physicsFolder.add(this, 'enabled').name('Debug')
    physicsFolder.close()
  }

  update() {
    if (this.enabled) {
      const { vertices, colors } = this.world.debugRender()
      this.mesh.geometry.setAttribute('position', new BufferAttribute(vertices, 3))
      this.mesh.geometry.setAttribute('color', new BufferAttribute(colors, 4))
      this.mesh.visible = true
    } else {
      this.mesh.visible = false
    }
  }
}
