import { inject, injectable } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import GUI, { Controller } from 'lil-gui'
import { PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { findGUIFolder } from '@/core/utils/utils'
import { GAMETYPES } from '@/canvas/types/types'
import type { GameStateService } from '@/canvas/state/GameStateService'
import { Subject } from 'rxjs'
import type { IWorld } from '@/core/interfaces/IWorld'
import type { IVRBase } from '@/core/interfaces/IVRBase'

@injectable()
export class CameraController implements IUpdate {
  private defaultCameraOptions = {
    aspect: 1,
  }

  private _orbitControls: OrbitControls

  private cameraFolderController: Controller

  public onCameraChange = new Subject<PerspectiveCamera>()

  private readonly _orbitControlCamera = new PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.01,
    200,
  )

  private debugOptions = {
    camera: 'OrbitControls',
  }

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(TYPES.GUI) private readonly _gui: GUI,
    @inject(TYPES.World) private readonly _world: IWorld,
    @inject(GAMETYPES.GameStateService)
    private readonly _gameStateService: GameStateService,
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
  ) {
    this.defaultCameraOptions = {
      aspect: this._threeJsBase.camera.aspect,
    }

    this._orbitControls = this.initOrbitControlsCamera()
    this._orbitControlCamera.name = 'OrbitControlCamera'
    this.setupOrbitControlsCamera()

    this._vrBase.camera.layers.enableAll()

    this._threeJsBase.camera = this._orbitControlCamera
    this._threeJsBase.camera.aspect = this.defaultCameraOptions.aspect
    this._threeJsBase.camera.updateProjectionMatrix()

    const onWindowResize = () => {
      if (this._threeJsBase.renderer.xr.isPresenting) return

      this._threeJsBase.camera.aspect = window.innerWidth / window.innerHeight
      this._threeJsBase.renderer.setSize(window.innerWidth, window.innerHeight)
      this._threeJsBase.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this._threeJsBase.camera.updateProjectionMatrix()
      this._threeJsBase.renderer.render(this._threeJsBase.scene, this._threeJsBase.camera)
    }

    window.addEventListener('resize', onWindowResize, false)

    this.cameraFolderController = this.addDebug()
  }

  private setupOrbitControlsCamera() {
    this._orbitControls.enableDamping = true
    this._orbitControls.rotateSpeed = 0.1
    this._orbitControls.enabled = true
    this._orbitControls.enableDamping = true
    this._orbitControls.update()
    this._orbitControls.target.set(0, 0, 0)
    this._orbitControlCamera.position.set(0, 0.5, 1)
    this._orbitControlCamera.updateProjectionMatrix()
  }

  private changeCurrentCamera(camera: PerspectiveCamera) {
    this._threeJsBase.camera = camera
    this._threeJsBase.camera.aspect = window.innerWidth / window.innerHeight
    this._threeJsBase.camera.updateProjectionMatrix()
    this._threeJsBase.renderer.setSize(window.innerWidth, window.innerHeight)
    this._threeJsBase.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this._threeJsBase.renderer.render(this._threeJsBase.scene, this._threeJsBase.camera)
  }

  private addDebug() {
    const cameraFolder = findGUIFolder(this._gui, 'Camera')
    return cameraFolder
      .add(this.debugOptions, 'camera', ['OrbitControls', 'VirtualReality'])
      .onChange((value: string) => {
        if (value === 'OrbitControls') {
          this.changeCurrentCamera(this._orbitControlCamera)
          this.setupOrbitControlsCamera()
        }
        if (value === 'VirtualReality') {
          this.changeCurrentCamera(this._vrBase.camera)
        }
      })
  }

  update() {
    if (this.debugOptions.camera === 'OrbitControls') {
      this._orbitControls.update()
    }
  }

  private initOrbitControlsCamera() {
    return new OrbitControls(this._orbitControlCamera, this._threeJsBase.renderer.domElement)
  }
}
