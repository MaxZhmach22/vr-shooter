import { inject, injectable } from 'inversify'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { TYPES } from '@/core/types/types'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import type { InputController } from '@/canvas/input/InputController'
import type { IVRInputEvent } from '@/core/interfaces/IVRInputEvent'
import { ControllerType } from '@/core/enums/ControllerType'
import {
  CircleGeometry,
  type Intersection,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Raycaster,
  Vector3,
} from 'three'
import { PlayerStateController } from '@/canvas/player/PlayerStateController'
import { GAMETYPES } from '@/canvas/types/types'
import { ControllerEventType } from '@/core/enums/ControllerEventType'
import { Layers } from '@/canvas/types/enums/layers'
import { Layers as LayersToCheck } from 'three'
import { TaskManager } from '@/core/managers/task-manager'
import type { IGripOpt } from '@/canvas/types/interfaces/grip/IGripOpt'
import type { IWorld } from '@/core/interfaces/IWorld'

@injectable()
export class ShootRaycastController implements IUpdate {
  private readonly _raycaster: Raycaster
  private readonly _obstaclesLayer = new LayersToCheck()
  private readonly _ballLayer = new LayersToCheck()

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(TYPES.InputController) private readonly _inputController: InputController,
    @inject(GAMETYPES.PlayerState) private readonly _playerState: PlayerStateController,
    @inject(GAMETYPES.GripOpt) private readonly _gripOpt: IGripOpt,
    @inject(TYPES.World) private readonly _world: IWorld,
  ) {
    this._raycaster = this.initRaycaster()
    this.shootRaycast = this.shootRaycast.bind(this)
    this._inputController.$inputEvent.subscribe(this.shootRaycast)
  }

  public update() {}

  private initRaycaster(): Raycaster {
    const raycaster = new Raycaster()
    raycaster.far = 100
    raycaster.layers.disableAll()
    raycaster.layers.enable(Layers.Walls)
    raycaster.layers.enable(Layers.Floor)
    raycaster.layers.enable(Layers.Obstacle)
    raycaster.layers.enable(Layers.Ball)

    this._obstaclesLayer.set(Layers.Obstacle)
    this._obstaclesLayer.enable(Layers.Walls)
    this._obstaclesLayer.enable(Layers.Floor)

    this._ballLayer.set(Layers.Ball)

    return raycaster
  }

  private shootRaycast(event: IVRInputEvent) {
    if (event.controller.controllerType !== ControllerType.MainHand) return
    if (event.event !== ControllerEventType.SelectEnd) return
    if (!this._playerState.weapon) return

    const startPoint = new Vector3()
    this._playerState.weapon.rayStartPoint!.getWorldPosition(startPoint)
    const quaternion = new Quaternion()
    this._playerState.weapon.rayStartPoint!.getWorldQuaternion(quaternion)
    const direction = new Vector3(0, 0, 1).applyQuaternion(quaternion)
    this._raycaster.set(startPoint, direction)

    const intersects = this._raycaster.intersectObjects(this._threeJsBase.scene.children, true)
    if (intersects.length <= 0) return
    if (intersects[0].object.layers.test(this._obstaclesLayer)) {
      this.createDint(intersects[0])
      return
    }
    if (intersects[0].object.layers.test(this._ballLayer)) {
      console.log('Ball hit')
      const id = intersects[0].object.id
      const ball = this._world.getDynamicObjects(id)
      if (ball) {
        ball.rigidBody.applyImpulseAtPoint(
          direction.clone().normalize().multiplyScalar(10),
          intersects[0].point,
          true,
        )
      }
      return
    }
  }

  private async createDint(intersect: Intersection) {
    if (intersect.face === null) return
    const cirle = new CircleGeometry(0.1, 32)
    const material = new MeshBasicMaterial({ color: 0xffff00, side: 2 })
    const circleMesh = new Mesh(cirle, material)
    const normal = intersect.face!.normal.clone().normalize()
    const position = intersect.point.clone()
    circleMesh.position.copy(position.add(normal.clone().multiplyScalar(0.01)))
    circleMesh.lookAt(position.clone().add(normal))
    this._threeJsBase.scene.add(circleMesh)
    await TaskManager.task(3000)
    this._threeJsBase.scene.remove(circleMesh)
  }
}
