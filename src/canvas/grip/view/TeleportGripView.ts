import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type PerspectiveCamera,
  RingGeometry,
  type WebGLRenderer,
} from 'three'
import { ModelsResources } from '@/core/managers/models-resources'
import { BaseGripView } from '@/canvas/grip/view/BaseGripView'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'
import type { IVRController } from '@/core/interfaces/IVRController'
import type { ITeleportGripOpt } from '@/canvas/types/interfaces/grip/ITeleportGripOpt'
import GUI from 'lil-gui'
import { GripTypes } from '@/canvas/types/enums/grip-types'
import { Layers } from '@/canvas/types/enums/layers'

export class TeleportGripView extends BaseGripView {
  private readonly hand: Mesh
  protected readonly mesh: HTMLMesh

  gripType = GripTypes.Teleport
  rayStartPoint = null

  constructor(
    gl: WebGLRenderer,
    vrCamera: PerspectiveCamera,
    teleportController: IVRController,
    controllers: IVRController[],
    private readonly _teleportGripOpt: ITeleportGripOpt,
  ) {
    super(gl, vrCamera, controllers, _teleportGripOpt.baseGripOpt)
    this._teleportGripOpt.log = () => console.log(this._teleportGripOpt)
    this.hand = this.init()
    const line = this.buildController(teleportController.inputSource)
    teleportController.line = line
    teleportController.controller.add(line as Mesh)
    this.mesh = this.initPanelMesh(this.gui)
    this.mesh.visible = this._teleportGripOpt.visible
  }

  private init(): Mesh {
    const model = ModelsResources.get('teleport_hand')!.scene
    const hand = new Mesh(
      // @ts-expect-error - geometry is not a property of Object3D
      model.children[0].geometry,
      new MeshStandardMaterial({ color: '#888888' }),
    )
    hand.rotation.x = this._teleportGripOpt.teleport.rotation.x
    hand.rotation.y = this._teleportGripOpt.teleport.rotation.y
    hand.rotation.z = this._teleportGripOpt.teleport.rotation.z
    this.add(hand)
    return hand
  }

  private buildController(data: XRInputSource) {
    let geometry
    let material

    switch (data.targetRayMode) {
      case 'tracked-pointer':
        return this.createLine()
      case 'gaze':
        geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
        material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
        return new Mesh(geometry, material)

      default:
        break
    }

    return null
  }

  private createLine(): Line {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
    geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))

    const material = new LineBasicMaterial({
      vertexColors: true,
      blending: AdditiveBlending,
    })

    const line = new Line(geometry, material)
    line.name = 'TeleportLine'
    line.layers.enable(Layers.Helpers)
    return line
  }

  protected initPanelMesh(gui: GUI) {
    const mesh = new HTMLMesh(gui.domElement)

    mesh.position.x = this._teleportGripOpt.baseGripOpt.position.x
    mesh.position.y = this._teleportGripOpt.baseGripOpt.position.y
    mesh.position.z = this._teleportGripOpt.baseGripOpt.position.z

    mesh.rotation.x = this._teleportGripOpt.baseGripOpt.rotation.x
    mesh.rotation.y = this._teleportGripOpt.baseGripOpt.rotation.y
    mesh.rotation.z = this._teleportGripOpt.baseGripOpt.rotation.z

    mesh.scale.setScalar(this._teleportGripOpt.baseGripOpt.scale)

    this.hand.position.x = this._teleportGripOpt.teleport.position.x
    this.hand.position.y = this._teleportGripOpt.teleport.position.y
    this.hand.position.z = this._teleportGripOpt.teleport.position.z

    this.hand.rotation.x = this._teleportGripOpt.teleport.rotation.x
    this.hand.rotation.y = this._teleportGripOpt.teleport.rotation.y
    this.hand.rotation.z = this._teleportGripOpt.teleport.rotation.z

    this.hand.scale.setScalar(this._teleportGripOpt.teleport.scale)

    this.interactiveGroup.add(mesh)
    return mesh
  }
}
