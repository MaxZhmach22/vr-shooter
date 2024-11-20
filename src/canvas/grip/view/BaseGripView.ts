import { Object3D, type PerspectiveCamera, type WebGLRenderer } from 'three'
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup'
import type { IVRController } from '@/core/interfaces/IVRController'
import GUI from 'lil-gui'
import type { IBaseGripOpt } from '@/canvas/types/interfaces/grip/IBaseGripOpt'
import type { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'

export abstract class BaseGripView extends Object3D {
  protected interactiveGroup: InteractiveGroup
  protected gui: GUI
  protected abstract mesh: HTMLMesh

  constructor(
    private readonly _gl: WebGLRenderer,
    private readonly _vrCamera: PerspectiveCamera,
    private readonly _controllers: IVRController[],
    private readonly _baseGripOpt: IBaseGripOpt,
  ) {
    super()
    this.interactiveGroup = new InteractiveGroup()
    this.interactiveGroup.listenToPointerEvents(this._gl, this._vrCamera)
    this.interactiveGroup.listenToXRControllerEvents(this._controllers[0].controller)
    this.interactiveGroup.listenToXRControllerEvents(this._controllers[1].controller)

    this.gui = this.initGUI()
    this.add(this.interactiveGroup)
  }

  protected initGUI(): GUI {
    const gui = new GUI({ width: 300 })
    const panel = gui.addFolder('Panel')
    const position = panel.addFolder('Position')
    const rotation = panel.addFolder('Rotation')
    const scale = panel.addFolder('Scale')

    position
      .add(this._baseGripOpt.position, 'x', -0.2, 0.2, 0.01)
      .onFinishChange((value: number) => {
        this.mesh.position.x = value
      })
    position
      .add(this._baseGripOpt.position, 'y', -0.2, 0.2, 0.01)
      .onFinishChange((value: number) => {
        this.mesh.position.y = value
      })
    position
      .add(this._baseGripOpt.position, 'z', -0.2, 0.2, 0.01)
      .onFinishChange((value: number) => {
        this.mesh.position.z = value
      })
    rotation
      .add(this._baseGripOpt.rotation, 'x', -1.57, 1.57, 0.01)
      .onFinishChange((value: number) => {
        this.mesh.rotation.x = value
      })
    rotation
      .add(this._baseGripOpt.rotation, 'y', -1.57, 1.57, 0.01)
      .onFinishChange((value: number) => {
        this.mesh.rotation.y = value
      })
    rotation
      .add(this._baseGripOpt.rotation, 'z', -1.57, 1.57, 0.01)
      .onFinishChange((value: number) => {
        this.mesh.rotation.z = value
      })
    scale.add(this._baseGripOpt, 'scale', 0.5, 1.5, 0.1).onFinishChange((value: number) => {
      this.mesh.scale.x = value
    })
    gui.domElement.style.visibility = 'hidden'
    panel.show(this._baseGripOpt.visible)
    return gui
  }

  protected abstract initPanelMesh(gui: GUI): HTMLMesh
}
