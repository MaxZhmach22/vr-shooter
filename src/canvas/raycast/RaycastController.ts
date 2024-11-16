import { inject, injectable } from 'inversify'
import { GAMETYPES } from '@/canvas/types/types'
import type { IGameStateService } from '@/canvas/types/interfaces/IGameStateService'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, type Vector3 } from 'three'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type GUI from 'lil-gui'
import { findGUIFolder } from '@/core/utils/utils'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { InputController } from '@/canvas/input/InputController'
import type { IVRInputEvent } from '@/core/interfaces/IVRInputEvent'
import { ControllerEventType } from '@/core/enums/ControllerEventType'
import { Subject } from 'rxjs'

@injectable()
export class RaycastController implements IUpdate {
  public $floorIntersect = new Subject<Vector3>()

  private readonly _raycaster: Raycaster
  private readonly _floorPanel: Mesh
  private tempMatrix = new Matrix4()

  constructor(
    @inject(GAMETYPES.GameStateService)
    private readonly gameStateService: IGameStateService,
    @inject(TYPES.ThreeJsBase) private readonly threeJSBase: IThreeJsBase,
    @inject(TYPES.GUI) private readonly gui: GUI,
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
    @inject(TYPES.InputController) private readonly inputController: InputController,
  ) {
    this._raycaster = this.createRaycaster()
    this._floorPanel = this.createFloorPanel()
    this.floorIntersect = this.floorIntersect.bind(this)

    this.inputController.$inputEvent.subscribe(this.floorIntersect)
  }

  update() {}

  private floorIntersect(event: IVRInputEvent) {
    if (event.event !== ControllerEventType.SelectEnd) return

    const controller = event.controller.controller
    this.tempMatrix.identity().extractRotation(controller.matrixWorld)
    this._raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
    this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix)

    const floorTouched = this._raycaster.intersectObject(this._floorPanel)
    if (floorTouched.length <= 0) return

    this.$floorIntersect.next(floorTouched[0].point)
  }

  private addDebug() {
    const raycastFolder = findGUIFolder(this.gui, 'Raycast')
    raycastFolder.close()
  }

  private reset() {}

  private createRaycaster(): Raycaster {
    const raycaster = new Raycaster()
    raycaster.layers.enable(7)
    return raycaster
  }

  private createFloorPanel() {
    const panelGeometry = new PlaneGeometry(100, 100)
    const panelMaterial = new MeshBasicMaterial({ color: 0x0000ff })

    const panel = new Mesh(panelGeometry, panelMaterial)
    panel.position.set(0, 0, 0)
    panel.rotation.x = -Math.PI / 2
    panel.layers.set(7)
    panel.name = 'floor'
    panel.visible = false
    this.threeJSBase.scene.add(panel)

    return panel
  }
}
