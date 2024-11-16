import { inject, injectable } from 'inversify'
import { GAMETYPES } from '@/canvas/types/types'
import type { IGameStateService } from '@/canvas/types/interfaces/IGameStateService'
import { GameState } from '@/canvas/types/enums/gameState'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import {
  type Camera,
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  SphereGeometry,
  Vector2,
} from 'three'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type GUI from 'lil-gui'
import { findGUIFolder } from '@/core/utils/utils'
import {
  type Collider,
  ColliderDesc,
  type RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  Vector3,
} from '@dimforge/rapier3d'
import type { IWorld } from '@/core/interfaces/IWorld'
import { Subject } from 'rxjs'
import { clamp } from 'three/src/math/MathUtils'
import { Vector3 as Vec3 } from 'three/src/math/Vector3'
import type { IVRBase } from '@/core/interfaces/IVRBase'

@injectable()
export class RaycastController implements IUpdate {
  private readonly _raycaster: Raycaster
  private readonly _touchPanel: Mesh
  private readonly _capsPanel: Mesh
  private readonly _pointerMesh: Mesh
  private readonly _rigidbody: RigidBody
  private readonly _sphereCollider: Collider
  private readonly _rbPosition = new Vector3(0, 0, 0)

  private _startOffsetY = 0
  private _upTouch = false

  private _linVel = new Vector3(0, 0, 0)
  private _cameraPosition = new Vec3(0, 0, 0)

  private readonly _pointer = new Vector2()
  private _isPointerDown = {
    value: false,
  }

  public $pointerDown = new Subject<boolean>()

  get pointerMesh(): Mesh {
    return this._pointerMesh
  }

  private debug = {
    isDebugOn: false,
  }

  private tempMatrix = new Matrix4()

  constructor(
    @inject(GAMETYPES.GameStateService)
    private readonly gameStateService: IGameStateService,
    @inject(TYPES.ThreeJsBase) private readonly threeJSBase: IThreeJsBase,
    @inject(TYPES.GUI) private readonly gui: GUI,
    @inject(TYPES.World) private readonly world: IWorld,
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
  ) {
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onBlur = this.onBlur.bind(this)

    this._raycaster = this.createRaycaster()
    this._touchPanel = this.createTouchPanel()
    this._capsPanel = this.createCapsPanel()
    this._pointerMesh = new Mesh(
      new SphereGeometry(0.01),
      new MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
    )

    this._rigidbody = this.world.world.createRigidBody(
      RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0).setCanSleep(false),
    )

    this.vrBase.controllers.rightController.controller.addEventListener('selectstart', () => {
      this.vrBase.controllers.rightController.userData.isSelecting = true
      this._isPointerDown.value = true
      console.log('selectstart')
    })
    this.vrBase.controllers.rightController.controller.addEventListener('selectend', () => {
      this.vrBase.controllers.rightController.userData.isSelecting = false
      this._isPointerDown.value = false
      console.log('selectend')
    })

    this.vrBase.controllers.leftController.controller.addEventListener('selectstart', () => {
      this.vrBase.controllers.leftController.userData.isSelecting = true
      this._isPointerDown.value = true
      console.log('selectstart')
    })
    this.vrBase.controllers.leftController.controller.addEventListener('selectend', () => {
      this.vrBase.controllers.leftController.userData.isSelecting = false
      this._isPointerDown.value = false
      console.log('selectend')
    })

    const shape = ColliderDesc.ball(0.01)
    this._sphereCollider = this.world.world.createCollider(shape, this._rigidbody)
    this._sphereCollider.setCollisionGroups(0b10000000)

    this.threeJSBase.scene.add(this._pointerMesh)
    this.addDebug()

    this.gameStateService.onChangeState.subscribe((state) => {
      switch (state) {
        case GameState.ReadyForGame:
          this.reset()
          this.addSubscriptions()
          break
        case GameState.Blowed:
        case GameState.CountCaps:
          this.unSubscriptions()
          break
        default:
          break
      }
    })
  }

  update(deltaTime: number, camera: Camera) {
    this._cameraPosition = camera.position.clone()
    this._capsPanel.lookAt(this._cameraPosition)
    this._touchPanel.lookAt(this._cameraPosition)

    if (this._rigidbody.bodyType() === RigidBodyType.Dynamic) {
      this._linVel = this._rigidbody.linvel()
      this._linVel.y = clamp(this._linVel.y, -6, 2)
      this._rigidbody.setLinvel(this._linVel, true)
      this._pointerMesh.position.y = this._rigidbody.translation().y
      if (this._rigidbody.translation().y <= 0) {
        this._rigidbody.setBodyType(RigidBodyType.KinematicPositionBased, true)
        this._pointerMesh.position.y = 0
        this._rbPosition.x = 0
        this._rbPosition.y = 0
        this._rbPosition.z = 0
        this._rigidbody.setNextKinematicTranslation(this._rbPosition)
      }
    }

    if (!this._isPointerDown.value) return

    if (this.threeJSBase.renderer.xr.isPresenting) {
      const controller = this.vrBase.controllers.leftController.userData.isSelecting
        ? this.vrBase.controllers.leftController.controller
        : this.vrBase.controllers.rightController.controller

      this.tempMatrix.identity().extractRotation(controller.matrixWorld)
      this._raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix)
    } else {
      this._raycaster.setFromCamera(this._pointer, camera)
    }

    if (this.gameStateService.currentState !== GameState.CapsUp) {
      const capsTouched = this._raycaster.intersectObject(this._capsPanel)
      if (capsTouched.length <= 0) return
      console.log('capsTouched')
      this._startOffsetY = capsTouched[0].point.y
      this.gameStateService.changeState(GameState.CapsUp)
      this._rigidbody.resetForces(true)
      this.world.world.step()
    } else {
      const intersect = this._raycaster.intersectObject(this._touchPanel)

      if (intersect.length <= 0) {
        this._rigidbody.setBodyType(RigidBodyType.Dynamic, true)
        this.gameStateService.changeState(GameState.ThrowCaps)
      } else {
        if (intersect[0].point.y < this._startOffsetY && !this._upTouch) {
          this._startOffsetY = intersect[0].point.y
        }

        if (intersect[0].point.y > this._startOffsetY && !this._upTouch) {
          this._upTouch = true
        }

        this._rbPosition.y = intersect[0].point.y - this._startOffsetY
        this._rigidbody.setNextKinematicTranslation(this._rbPosition)
        this._pointerMesh.position.y = this._rigidbody.translation().y
      }
    }
  }

  private onPointerMove(event: PointerEvent) {
    this._pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this._pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  private onPointerDown(event: PointerEvent) {
    this._isPointerDown.value = true
    this.$pointerDown.next(true)
    this.onPointerMove(event)
    console.log('pointerdown')
  }

  private onPointerUp() {
    this._isPointerDown.value = false
    this.$pointerDown.next(false)
    this._rigidbody.setBodyType(RigidBodyType.Dynamic, true)
    console.log('pointerup')
  }

  private onBlur() {
    this._isPointerDown.value = false
    this.$pointerDown.next(false)
    this._rigidbody.setBodyType(RigidBodyType.Dynamic, true)
    this.gameStateService.changeState(GameState.ThrowCaps)
    console.log('blur')
  }

  private unSubscriptions() {
    console.log('unSubscriptions')
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('blur', this.onBlur)
    this.reset()
  }

  private addSubscriptions() {
    console.log('addSubscriptions')
    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('blur', this.onBlur)
  }

  private createTouchPanel(): Mesh {
    const panel = new PlaneGeometry(0.5, 1)
    const material = new MeshBasicMaterial({
      color: 0x00ff00,
      side: DoubleSide,
      wireframe: true,
    })
    const mesh = new Mesh(panel, material)
    mesh.layers.set(7)
    this.threeJSBase.scene.add(mesh)
    return mesh
  }

  private createCapsPanel(): Mesh {
    const panel = new PlaneGeometry(0.18, 0.26)
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      side: DoubleSide,
      wireframe: true,
    })
    const mesh = new Mesh(panel, material)
    mesh.position.set(0, 0.1, 0)
    mesh.layers.set(7)
    this.threeJSBase.scene.add(mesh)
    return mesh
  }

  private addDebug() {
    const raycastFolder = findGUIFolder(this.gui, 'Raycast')
    this._pointerMesh.visible = this.debug.isDebugOn
    this._touchPanel.visible = this.debug.isDebugOn
    this._capsPanel.visible = this.debug.isDebugOn
    raycastFolder.add(this.debug, 'isDebugOn').onChange((value: boolean) => {
      this._pointerMesh.visible = value
      this._touchPanel.visible = value
      this._capsPanel.visible = value
    })
    raycastFolder.close()
  }

  private reset() {
    this._isPointerDown.value = false
    this._upTouch = false
    this._startOffsetY = 0
    this._rigidbody.setBodyType(RigidBodyType.KinematicPositionBased, true)
    this.$pointerDown.next(false)
    this._pointerMesh.position.y = 0
    this._pointer.set(0, 0)
    this._rbPosition.x = 0
    this._rbPosition.y = 0
    this._rbPosition.z = 0
    this._linVel.x = 0
  }

  private createRaycaster(): Raycaster {
    const raycaster = new Raycaster()
    raycaster.layers.enable(7)
    return raycaster
  }
}
