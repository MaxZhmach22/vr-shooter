import { inject, injectable } from 'inversify'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'

@injectable()
export class InputController {
  private lastTap = 0
  private readonly doubleTapDelay = 300

  constructor(
    @inject(TYPES.VRBase) private readonly vrBase: IVRBase,
    @inject(TYPES.ThreeJsBase) private readonly threeJsBase: IThreeJsBase,
  ) {
    this.onMobileDoubleTap = this.onMobileDoubleTap.bind(this)
    this.onDesktopDoubleTap = this.onDesktopDoubleTap.bind(this)
    this.addEventListeners = this.addEventListeners.bind(this)
    this.addVRControllerEventListeners = this.addVRControllerEventListeners.bind(this)

    this.threeJsBase.renderer.xr.addEventListener(
      'sessionstart',
      this.addVRControllerEventListeners,
    )
    this.threeJsBase.renderer.xr.removeEventListener(
      'sessionend',
      this.addVRControllerEventListeners,
    )
  }

  private addEventListeners(isMobile: boolean) {
    document.removeEventListener('touchstart', this.onMobileDoubleTap)
    window.removeEventListener('dblclick', this.onDesktopDoubleTap)

    if (isMobile) {
      document.addEventListener('touchstart', this.onMobileDoubleTap)
      window.removeEventListener('dblclick', this.onDesktopDoubleTap)
    } else {
      window.addEventListener('dblclick', this.onDesktopDoubleTap)
      document.removeEventListener('touchstart', this.onMobileDoubleTap)
    }
  }

  private onMobileDoubleTap() {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - this.lastTap

    if (tapLength < this.doubleTapDelay && tapLength > 0) {
      console.log('Double mobile tap detected')
    }

    this.lastTap = currentTime
  }

  private onDesktopDoubleTap() {
    console.log('Double desktop tap detected')
  }

  private addVRControllerEventListeners() {
    const rightController = this.vrBase.controllers.rightController.controller
    const leftController = this.vrBase.controllers.leftController.controller

    rightController.addEventListener('squeezeend', this.onSqueezeend)
    leftController.addEventListener('squeezeend', this.onSqueezeend)
  }

  private onSqueezeend = () => {}
}
