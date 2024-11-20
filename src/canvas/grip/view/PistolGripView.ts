import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  type PerspectiveCamera,
  type WebGLRenderer,
} from 'three'
import { ModelsResources } from '@/core/managers/models-resources'
import { BaseGripView } from '@/canvas/grip/view/BaseGripView'
import type { IVRController } from '@/core/interfaces/IVRController'
import type { IPistolGripOpt } from '@/canvas/types/interfaces/grip/IPistolGripOpt'
import GUI from 'lil-gui'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'

export class PistolGripView extends BaseGripView {
  private readonly pistol: Group
  private line: Line | null = null
  protected readonly mesh: HTMLMesh

  constructor(
    gl: WebGLRenderer,
    vrCamera: PerspectiveCamera,
    controllers: IVRController[],
    private readonly _pistolGripOpt: IPistolGripOpt,
  ) {
    super(gl, vrCamera, controllers, _pistolGripOpt.baseGripOpt)
    this._pistolGripOpt.log = () => console.log(this._pistolGripOpt)
    this.pistol = this.init()
    this.addDebug()
    this.mesh = this.initPanelMesh(this.gui)
  }

  private init(): Group {
    const pistol = ModelsResources.get('pistol')!.scene
    pistol.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshStandardMaterial({ color: 0x222222 })
      }
      if (child.name.toLowerCase().includes('start')) {
        child.add((this.line = this.createLine()))
        this.line.visible = this._pistolGripOpt.rayEnabled === 1
      }
    })
    pistol.rotation.x = -3.8
    pistol.rotation.z = 3.14
    this.add(pistol)
    return pistol
  }

  protected addDebug() {
    const pistol = this.gui.addFolder('Pistol')
    pistol.add(this._pistolGripOpt, 'rayEnabled', 0, 1, 1).onChange((value: number) => {
      if (this.line) {
        this.line.visible = value === 1
      }
    })

    const position = pistol.addFolder('Position')
    position
      .add(this._pistolGripOpt.pistol.position, 'x', -0.2, 0.2, 0.01)
      .onChange((value: number) => {
        this.pistol.position.x = value
      })
    position
      .add(this._pistolGripOpt.pistol.position, 'y', -0.2, 0.2, 0.01)
      .onChange((value: number) => {
        this.pistol.position.y = value
      })
    position
      .add(this._pistolGripOpt.pistol.position, 'z', -0.2, 0.2, 0.01)
      .onChange((value: number) => {
        this.pistol.position.z = value
      })

    const rotation = pistol.addFolder('Rotation')
    rotation
      .add(this._pistolGripOpt.pistol.rotation, 'x', -Math.PI, Math.PI, 0.01)
      .onChange((value: number) => {
        this.pistol.rotation.x = value
      })
    rotation
      .add(this._pistolGripOpt.pistol.rotation, 'y', -Math.PI, Math.PI, 0.01)
      .onChange((value: number) => {
        this.pistol.rotation.y = value
      })
    rotation
      .add(this._pistolGripOpt.pistol.rotation, 'z', -Math.PI, Math.PI, 0.01)
      .onChange((value: number) => {
        this.pistol.rotation.z = value
      })

    const scale = pistol.addFolder('Scale')
    scale.add(this._pistolGripOpt.pistol, 'scale', 0.5, 1.5, 0.1).onChange((value: number) => {
      this.pistol.scale.set(value, value, value)
    })

    pistol.add(this._pistolGripOpt, 'log')
  }

  private createLine(): Line {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, 10], 3))
    geometry.setAttribute('color', new Float32BufferAttribute([1, 0, 0, 0, 0, 0], 3))

    const material = new LineBasicMaterial({
      vertexColors: true,
      blending: AdditiveBlending,
    })

    return new Line(geometry, material)
  }

  protected initPanelMesh(gui: GUI) {
    const mesh = new HTMLMesh(gui.domElement)

    mesh.position.x = this._pistolGripOpt.baseGripOpt.position.x
    mesh.position.y = this._pistolGripOpt.baseGripOpt.position.y
    mesh.position.z = this._pistolGripOpt.baseGripOpt.position.z

    mesh.rotation.x = this._pistolGripOpt.baseGripOpt.rotation.x
    mesh.rotation.y = this._pistolGripOpt.baseGripOpt.rotation.y
    mesh.rotation.z = this._pistolGripOpt.baseGripOpt.rotation.z

    mesh.scale.setScalar(this._pistolGripOpt.baseGripOpt.scale)

    this.pistol.position.x = this._pistolGripOpt.pistol.position.x
    this.pistol.position.y = this._pistolGripOpt.pistol.position.y
    this.pistol.position.z = this._pistolGripOpt.pistol.position.z

    this.pistol.rotation.x = this._pistolGripOpt.pistol.rotation.x
    this.pistol.rotation.y = this._pistolGripOpt.pistol.rotation.y
    this.pistol.rotation.z = this._pistolGripOpt.pistol.rotation.z

    this.pistol.scale.setScalar(this._pistolGripOpt.pistol.scale)

    this.interactiveGroup.add(mesh)
    return mesh
  }
}
