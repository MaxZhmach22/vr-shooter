import { inject, injectable } from 'inversify'
import type { IPlayerState } from '@/canvas/types/interfaces/IPlayerState'
import type { BaseGripView } from '@/canvas/grip/view/BaseGripView'
import { GAMETYPES } from '@/canvas/types/types'
import type { GripViewController } from '@/canvas/grip/controller/GripViewController'
import type { IPlayerStateOpt } from '@/canvas/types/interfaces/IPlayerStateOpt'

@injectable()
export class PlayerStateController implements IPlayerState {
  public score: number = 0
  public alive: boolean = true
  public weapon: BaseGripView | null = null
  public teleport: BaseGripView | null = null

  constructor(
    @inject(GAMETYPES.GripViewController) private readonly _gripViewController: GripViewController,
    @inject(GAMETYPES.PlayerStateOpt) private readonly _initialPlayerStateOpt: IPlayerStateOpt,
  ) {
    this._gripViewController.$gripInitialized.subscribe((gripViews) => {
      this.setInitialGrips(
        gripViews.get(this._initialPlayerStateOpt.weapon)!,
        gripViews.get(this._initialPlayerStateOpt.teleport)!,
      )
      this.score = this._initialPlayerStateOpt.score
      this.alive = this._initialPlayerStateOpt.alive
      console.log('Ready to play')
    })
  }

  private setInitialGrips(weapon: BaseGripView, teleport: BaseGripView) {
    this.weapon = weapon
    this.teleport = teleport
  }
}
