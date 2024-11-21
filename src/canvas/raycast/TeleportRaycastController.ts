import { inject, injectable } from 'inversify'
import { GAMETYPES } from '@/canvas/types/types'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { CircleGeometry, Matrix4, Mesh, MeshBasicMaterial, Raycaster, type Vector3 } from 'three'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type GUI from 'lil-gui'
import type { InputController } from '@/canvas/input/InputController'
import type { IVRInputEvent } from '@/core/interfaces/IVRInputEvent'
import { ControllerEventType } from '@/core/enums/ControllerEventType'
import { Subject } from 'rxjs'
import type { IVRController } from '@/core/interfaces/IVRController'
import { SceneController } from '@/canvas/scene/SceneController'
import { Layers } from '@/canvas/types/enums/layers'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'
import { ControllerType } from '@/core/enums/ControllerType'

@injectable()
export class TeleportRaycastController implements IUpdate, IControllersInit {
  public $floorIntersect = new Subject<Vector3>()

  private readonly _raycaster: Raycaster
  private readonly _markMesh: Mesh
  private controllersInitialized = false
  private tempMatrix = new Matrix4()

  private intersectObjects: Mesh[] = []

  private teleportController: IVRController | null = null

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly threeJSBase: IThreeJsBase,
    @inject(TYPES.GUI) private readonly gui: GUI,
    @inject(TYPES.InputController) private readonly inputController: InputController,
    @inject(GAMETYPES.SceneController) private readonly sceneController: SceneController,
  ) {
    this._raycaster = this.createRaycaster()
    this._markMesh = this.createMarkMesh()
    this.floorIntersect = this.floorIntersect.bind(this)

    this.intersectObjects.push(this.sceneController.getFloor())
    this.intersectObjects.push(this.sceneController.getObstacles())

    this.inputController.$inputEvent.subscribe(this.floorIntersect)
  }

  public initControllers(mainController: IVRController, teleportController: IVRController) {
    this.teleportController = teleportController
    this.controllersInitialized = true
  }

  update() {
    if (!this.threeJSBase.renderer.xr.isPresenting) return
    if (!this.controllersInitialized) return

    this.moveMark(this.teleportController!)
  }

  private floorIntersect(event: IVRInputEvent) {
    if (event.controller.controllerType !== ControllerType.Teleport) return
    if (event.event !== ControllerEventType.SelectEnd) return

    this._markMesh.visible = false
    const controller = event.controller.controller
    this.tempMatrix.identity().extractRotation(controller.matrixWorld)
    this._raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
    this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix)

    const floorTouched = this._raycaster.intersectObjects(this.intersectObjects)
    if (floorTouched.length <= 0) return
    if (floorTouched[0].object.id === this.sceneController.getObstacles().id) return
    this.$floorIntersect.next(floorTouched[0].point)
  }

  private createRaycaster(): Raycaster {
    const raycaster = new Raycaster()
    raycaster.layers.enable(Layers.Floor)
    raycaster.layers.enable(Layers.Obstacle)
    return raycaster
  }

  private createMarkMesh(): Mesh {
    const geometry = new CircleGeometry(0.25, 32)
    const material = new MeshBasicMaterial({ color: 0xff00ff })
    const mesh = new Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.visible = false
    this.threeJSBase.scene.add(mesh)
    return mesh
  }

  private moveMark(controller: IVRController) {
    if (controller.userData.isSelecting) {
      this.tempMatrix.identity().extractRotation(controller.controller.matrixWorld)
      this._raycaster.ray.origin.setFromMatrixPosition(controller.controller.matrixWorld)
      this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix)

      const floorTouched = this._raycaster.intersectObjects(this.intersectObjects)
      if (floorTouched.length <= 0) return

      if (floorTouched[0].object.id === this.sceneController.getObstacles().id) {
        if (this._markMesh.visible) this._markMesh.visible = false
        return
      }
      if (!this._markMesh.visible) this._markMesh.visible = true
      this._markMesh.position.copy(floorTouched[0].point)
      this._markMesh.position.y += 0.01
    }
  }
}
