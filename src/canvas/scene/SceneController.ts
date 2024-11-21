import { inject, injectable } from 'inversify'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { TYPES } from '@/core/types/types'
import { AmbientLight, DirectionalLight, DirectionalLightHelper, Group } from 'three'
import { LevelView } from '@/canvas/scene/LevelView'
import type { IWorld } from '@/core/interfaces/IWorld'

@injectable()
export class SceneController {
  private readonly _levelView: LevelView

  get levelView() {
    return this._levelView
  }

  constructor(
    @inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase,
    @inject(TYPES.World) private readonly _world: IWorld,
  ) {
    this._threeJsBase.scene.add((this._levelView = new LevelView(this._world)))

    const light = new AmbientLight(0xffffff, 1.5)
    this._threeJsBase.scene.add(light)

    const directionalLight = new DirectionalLight(0xffffff, 5.5)
    directionalLight.castShadow = true
    directionalLight.position.set(0, 10, 0)
    const group = new Group()
    group.position.set(-5, 0, -5)
    directionalLight.target = group

    const directionalLightHelper = new DirectionalLightHelper(directionalLight, 5)
    this._threeJsBase.scene.add(directionalLight)
    this._threeJsBase.scene.add(directionalLightHelper)

    console.log('SceneController')
  }
}
