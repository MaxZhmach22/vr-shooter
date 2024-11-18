import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  WebGLRenderer,
} from 'three'

import { CustomEventDispatcher } from '@/canvas/types/events/CustomEventDispatcher'
import type { IVRController } from '@/core/interfaces/IVRController'
import { ControllerType } from '@/core/enums/ControllerType'

export class ControllerBuilder {
  private readonly _leftController: IVRController

  private readonly _rightController: IVRController

  get leftController() {
    return this._leftController
  }

  get rightController() {
    return this._rightController
  }

  constructor(
    private readonly gl: WebGLRenderer,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly vr: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly intersection: any,
  ) {
    const controllerGrip1 = gl.xr.getControllerGrip(0)

    this._leftController = {
      controller: gl.xr.getController(1),
      controllerGrip: controllerGrip1,
      dispatcher: new CustomEventDispatcher(),
      controllerType: ControllerType.Left,
      userData: {
        isSelecting: false,
      },
      gamepad: undefined,
    }

    this._leftController.controller.name = 'leftController'
    this._leftController.controller.addEventListener('connected', (event) => {
      // @ts-expect-error no type for data
      this._leftController.controller.add(this.buildController(event.data))
    })

    const controllerGrip2 = gl.xr.getControllerGrip(1)

    this._rightController = {
      controller: gl.xr.getController(0),
      controllerGrip: controllerGrip2,
      dispatcher: new CustomEventDispatcher(),
      controllerType: ControllerType.Right,
      userData: {
        isSelecting: false,
      },
      gamepad: undefined,
    }
    this._rightController.controller.name = 'rightController'
    this._rightController.controller.addEventListener('connected', (event) => {
      // @ts-expect-error no type for data
      this._rightController.controller.add(this.buildController(event.data))
    })
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
}
