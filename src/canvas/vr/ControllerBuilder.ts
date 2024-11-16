import {
  AdditiveBlending,
  BufferGeometry,
  Euler,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import type { IJoyStickRotation } from '@/canvas/types/interfaces/IJoyStickRotation'
import type { XRTargetRaySpace } from 'three'
import { CustomEventDispatcher } from '@/canvas/types/events/CustomEventDispatcher'

interface IController {
  controller: XRTargetRaySpace
  controllerGrip: XRTargetRaySpace
  dispatcher: CustomEventDispatcher
  userData: {
    isSelecting: boolean
  }
}

export class ControllerBuilder {
  private readonly _leftController: IController

  private readonly _rightController: IController

  get leftController() {
    return this._leftController
  }

  get rightController() {
    return this._rightController
  }

  private _currentRotation = new Euler()

  constructor(
    private readonly gl: WebGLRenderer,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly vr: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly intersection: any,
  ) {
    const controllerModelFactory = new XRControllerModelFactory()

    const controllerGrip1 = gl.xr.getControllerGrip(0)
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))

    this._leftController = {
      controller: gl.xr.getController(1),
      controllerGrip: controllerGrip1,
      dispatcher: new CustomEventDispatcher(),
      userData: {
        isSelecting: false,
      },
    }

    const leftControllerStart = () => this.onSelectStart(this._leftController)
    const leftControllerEnd = () => this.onSelectEnd(this._leftController)
    const rightControllerStart = () => this.onSelectStart(this._rightController)
    const rightControllerEnd = () => this.onSelectEnd(this._rightController)

    this._leftController.controller.name = 'leftController'
    this._leftController.controller.addEventListener('selectstart', leftControllerStart)
    this._leftController.controller.addEventListener('selectend', leftControllerEnd)
    this._leftController.controller.addEventListener('connected', (event) => {
      // @ts-expect-error no type for data
      this._leftController.controller.add(this.buildController(event.data))
    })
    // this._leftController.controller.addEventListener('disconnected',  () => {
    //   this.remove(this.children[0]);
    // });
    this._leftController.dispatcher.addEventListener('joyStickRotation', (event) =>
      this.onJoystickRotation(event.data),
    )

    const controllerGrip2 = gl.xr.getControllerGrip(1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))

    this._rightController = {
      controller: gl.xr.getController(0),
      controllerGrip: controllerGrip2,
      dispatcher: new CustomEventDispatcher(),
      userData: {
        isSelecting: false,
      },
    }
    this._rightController.controller.name = 'rightController'
    this._rightController.controller.addEventListener('selectstart', rightControllerStart)
    this._rightController.controller.addEventListener('selectend', rightControllerEnd)
    this._rightController.controller.addEventListener('connected', (event) => {
      // @ts-expect-error no type for data
      this._rightController.controller.add(this.buildController(event.data))
    })
    // this._rightController.controller.addEventListener('disconnected',  () => {
    //   this.remove(this.children[0]);
    // });
    this._rightController.dispatcher.addEventListener('joyStickRotation', (event) =>
      this.onJoystickRotation(event.data),
    )

    // The XRControllerModelFactory will automatically fetch controller models
    // that match what the user is holding as closely as possible. The models
    // should be attached to the object returned from getControllerGrip in
    // order to match the orientation of the held device.
  }

  private buildController(data: XRInputSource) {
    let geometry
    let material

    switch (data.targetRayMode) {
      case 'tracked-pointer':
        geometry = new BufferGeometry()
        geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
        geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))

        material = new LineBasicMaterial({
          vertexColors: true,
          blending: AdditiveBlending,
        })

        return new Line(geometry, material)

      case 'gaze':
        geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
        material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
        return new Mesh(geometry, material)

      default:
        break
    }

    return null
  }

  private onSelectStart(controller: IController) {
    controller.userData.isSelecting = true
  }

  private onSelectEnd(controller: IController) {
    controller.userData.isSelecting = false
    if (this.intersection.current) {
      this.updatePosition(this.intersection.current, new Quaternion())
    }
  }

  private onJoystickRotation(event: IJoyStickRotation) {
    this._currentRotation.y += event.gamepad.axes[2] > 0 ? 45 : -45
    this.updatePosition(new Vector3(), new Quaternion().setFromEuler(this._currentRotation))
  }

  private updatePosition(position: Vector3, quaternion: Quaternion) {
    const offsetPosition = {
      x: -position.x,
      y: -position.y,
      z: -position.z,
      w: 1,
    }
    const transform = new XRRigidTransform(offsetPosition, quaternion)
    const teleportSpaceOffset = this.vr.referenceSpace.getOffsetReferenceSpace(transform)
    this.gl.xr.setReferenceSpace(teleportSpaceOffset)
  }
}
