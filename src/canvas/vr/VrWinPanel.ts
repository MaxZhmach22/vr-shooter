import { inject, injectable } from 'inversify'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { GAMETYPES } from '@/canvas/types/types'
import type { IVRBase } from '@/core/interfaces/IVRBase'
import type GUI from 'lil-gui'
import type { GameStateService } from '@/canvas/state/GameStateService'
import { TYPES } from '@/core/types/types'
import { update as uiUpdate, Block, Text } from 'three-mesh-ui'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { Color, Group, Vector3 } from 'three'

@injectable()
export class VrWinPanel implements IUpdate {
  private text = new Text({
    content: 'Win',
    fontSize: 0.02,
  })

  private textCount = new Text({
    content: '0',
    fontSize: 0.04,
  })

  private container = new Block({
    width: 0.1,
    height: 0.1,
    backgroundColor: new Color('#462055'),
    fontFamily: './font/Roboto-msdf.json',
    fontTexture: './font/Roboto-msdf.png',
    textAlign: 'center',
  })

  private containerCount = new Block({
    width: 0.06,
    height: 0.05,
    backgroundColor: new Color('#9d47bd'),
    fontFamily: './font/Roboto-msdf.json',
    fontTexture: './font/Roboto-msdf.png',
    textAlign: 'center',
  })

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(TYPES.GUI) private readonly _gui: GUI,
    @inject(GAMETYPES.GameStateService)
    private readonly _gameStateService: GameStateService,
    @inject(TYPES.VRBase) private readonly _vrBase: IVRBase,
  ) {
    this.container.add(this.text)
    this.containerCount.add(this.textCount)
    this.containerCount.position.set(0, -0.015, 0.02)
    this.textCount.position.set(0, 0, 0)

    this.container.add(this.containerCount)

    const group = new Group()
    group.add(this.container)
    group.add(this.containerCount)

    this._threeJsBase.scene.add(group)

    group.position.copy(new Vector3(-0.96, 0.17, -0.27))
    group.rotation.y = Math.PI / 3
    group.visible = false

    this._gameStateService.onChangeState.subscribe(() => {
      if (!this._threeJsBase.renderer.xr.isPresenting) return
    })
  }

  public update(): void {
    uiUpdate()
  }
}
