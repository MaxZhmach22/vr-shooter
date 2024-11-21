import { inject, injectable } from 'inversify'
import { GAMETYPES } from '@/canvas/types/types'
import { TYPES } from '@/core/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import { TeleportGripView } from '@/canvas/grip/view/TeleportGripView'
import { PistolGripView } from '@/canvas/grip/view/PistolGripView'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import type { IPistolGripOpt } from '@/canvas/types/interfaces/grip/IPistolGripOpt'
import type { IControllersInit } from '@/core/interfaces/IControllersInit'
import type { IVRController } from '@/core/interfaces/IVRController'
import type { BaseGripView } from '@/canvas/grip/view/BaseGripView'
import type { ITeleportGripOpt } from '@/canvas/types/interfaces/grip/ITeleportGripOpt'
import type { GripTypes } from '@/canvas/types/enums/grip-types'
import { Subject } from 'rxjs'

@injectable()
export class GripViewController implements IUpdate, IControllersInit {
  private readonly _gripViews: Map<GripTypes, BaseGripView> = new Map()

  get gripViews() {
    return this._gripViews
  }

  public $gripInitialized = new Subject<Map<GripTypes, BaseGripView>>()

  constructor(
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(GAMETYPES.PistolGripOpt) private readonly _pistolGripOpt: IPistolGripOpt,
    @inject(GAMETYPES.TeleportGripOpt) private readonly _teleportGripOpt: ITeleportGripOpt,
  ) {}

  public initControllers(mainController: IVRController, teleportController: IVRController) {
    const teleportView = new TeleportGripView(
      this._threeJsBase.renderer,
      this._vrBase.camera,
      teleportController,
      [mainController, teleportController],
      this._teleportGripOpt,
    )
    teleportController.controllerGrip.add(teleportView)
    this._gripViews.set(teleportView.gripType, teleportView)

    const pistolView = new PistolGripView(
      this._threeJsBase.renderer,
      this._vrBase.camera,
      [mainController, teleportController],
      this._pistolGripOpt,
    )
    mainController.controllerGrip.add(pistolView)
    this._gripViews.set(pistolView.gripType, pistolView)

    this.$gripInitialized.next(this._gripViews)
  }

  public update() {}
}
