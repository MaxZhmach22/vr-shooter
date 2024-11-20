import { type Group, Mesh, MeshStandardMaterial, Object3D } from 'three'
import type { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import { ModelsResources } from '@/core/managers/models-resources'

export class TeleportGripView extends Object3D {
  constructor(
    private readonly _factory: XRControllerModelFactory,
    private readonly _controllerGrip: Group,
  ) {
    super()
    this.init()
  }

  private init() {
    const model = ModelsResources.get('teleport_hand')!.scene
    const hand = new Mesh(
      // @ts-expect-error - geometry is not a property of Object3D
      model.children[0].geometry,
      new MeshStandardMaterial({ color: '#888888' }),
    )
    hand.rotation.x = 1.7
    hand.rotation.y = -0.28
    hand.rotation.z = -Math.PI
    this.add(hand)
  }
}
