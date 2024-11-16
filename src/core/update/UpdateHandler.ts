import type { IUpdateHandler } from '@/core/interfaces/IUpdateHandler'
import { inject, injectable, multiInject } from 'inversify'
import 'reflect-metadata'
import { TYPES } from '@/core/types/types'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { Clock } from 'three'
import type GUI from 'lil-gui'
import { findGUIFolder } from '@/core/utils/utils'
import { ThreePerf } from 'three-perf'
import { IS_PROD } from '@/main'
import { TaskManager } from '@/core/managers/task-manager'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import { GAMETYPES } from '@/canvas/types/types'
import type { ICommonDebugOpt } from '@/canvas/types/interfaces/ICommonDebugOpt'
import type { IPostProcessingOpt } from '@/canvas/types/interfaces/IPostProcessingOpt'

@injectable()
export class UpdateHandler implements IUpdateHandler {
  private clock = new Clock()
  private deltaTime: number = 0

  private readonly perf: ThreePerf | null = null

  get getDeltaTime(): number {
    return this.deltaTime
  }

  private readonly debugOptions

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly threeJSBase: IThreeJsBase,
    @multiInject(TYPES.Update) private readonly updatables: IUpdate[],
    @inject(TYPES.GUI) private readonly gui: GUI,
    @inject(GAMETYPES.CommonDebugOpt)
    private readonly commonDebugOpt: ICommonDebugOpt,
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
    @inject(GAMETYPES.PostProcessingOpt)
    private readonly postProcessingOpt: IPostProcessingOpt,
  ) {
    this.handleUpdate = this.handleUpdate.bind(this)
    this.initUpdateLoop()

    if (!IS_PROD) {
      this.perf = new ThreePerf({
        anchorY: 'bottom',
        anchorX: 'left',
        domElement: document.body,
        renderer: this.threeJSBase.renderer,
        memory: true,
        enabled: true,
      })
    }

    this.debugOptions = {
      debug: this.commonDebugOpt.cameraDebug,
      perfDebug: IS_PROD ? false : this.commonDebugOpt.perfDebug,
      timeScale: this.commonDebugOpt.timeScale,
    }

    const perfFolder = findGUIFolder(this.gui, 'Performance')
    perfFolder
      .add(this.debugOptions, 'perfDebug')
      .name('Statistics')
      .onChange((value: boolean) => {
        if (!this.perf) return
        this.perf.enabled = value
        this.perf.visible = value
      })
    const timeControl = perfFolder
      .add(this.debugOptions, 'timeScale', 0, 3)
      .step(0.01)
      .name('Time scale')

    const changeSpeed = (value: number) => {
      if (this.debugOptions.timeScale + value < 0) return
      else if (this.debugOptions.timeScale + value > 3) return
      this.debugOptions.timeScale += value
    }

    if (!IS_PROD) {
      window.addEventListener('keydown', (e) => {
        if (e.key === '+') {
          changeSpeed(0.05)
          timeControl.updateDisplay()
        }
        if (e.key === '-') {
          changeSpeed(-0.05)
          timeControl.updateDisplay()
        }
      })

      window.addEventListener('keydown', (e) => {
        if (e.key === 's') {
          if (this.gui._closed) this.gui.open()
          else this.gui.close()
        }
      })
    }
  }

  /**
   * Main update loop
   */
  public handleUpdate(): void {
    if (this.debugOptions.perfDebug && this.perf) {
      this.perf.begin()
    }

    this.deltaTime = this.clock.getDelta() * this.debugOptions.timeScale

    TaskManager.update(this.deltaTime)

    this.updatables.forEach((updatable: IUpdate) => {
      updatable.update(this.deltaTime, this.threeJSBase.camera)
    })

    if (this.threeJSBase.renderer.xr.isPresenting) {
      this.threeJSBase.renderer.render(this.threeJSBase.scene, this.vrBase.camera)
    } else {
      this.threeJSBase.renderer.render(this.threeJSBase.scene, this.threeJSBase.camera)
    }

    if (this.debugOptions.perfDebug && this.perf) {
      this.perf.end()
    }
  }

  private initUpdateLoop() {
    this.threeJSBase.renderer.setAnimationLoop(this.handleUpdate)

    window.addEventListener('blur', () => {
      if (!this.threeJSBase.renderer.xr.isPresenting) return

      // this.threeJSBase.camera.aspect = window.innerWidth / window.innerHeight
      // this.threeJSBase.renderer.setSize(window.innerWidth, window.innerHeight)
      // this.threeJSBase.renderer.setPixelRatio(
      //   Math.min(window.devicePixelRatio, 2),
      // )
      // this.threeJSBase.renderer.render(
      //   this.threeJSBase.scene,
      //   this.threeJSBase.camera,
      // )
      // this.threeJSBase.renderer.setAnimationLoop(null)
    })

    window.addEventListener('focus', () => {
      if (this.threeJSBase.renderer.xr.isPresenting) return
      // this.threeJSBase.camera.aspect = window.innerWidth / window.innerHeight
      // this.threeJSBase.renderer.setSize(window.innerWidth, window.innerHeight)
      // this.threeJSBase.renderer.setPixelRatio(
      //   Math.min(window.devicePixelRatio, 2),
      // )
      // this.threeJSBase.renderer.render(
      //   this.threeJSBase.scene,
      //   this.threeJSBase.camera,
      // )
      // this.threeJSBase.renderer.setAnimationLoop(this.handleUpdate)
    })
  }
}
