import { inject, injectable } from 'inversify'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { TYPES } from '@/core/types/types'
import { AmbientLight, DirectionalLight, DirectionalLightHelper, GridHelper, Group } from 'three'

@injectable()
export class SceneController {
  constructor(@inject(TYPES.ThreeJsBase) private readonly _threeJsBase: IThreeJsBase) {
    const gridHelper = new GridHelper(100, 100)
    this._threeJsBase.scene.add(gridHelper)

    const light = new AmbientLight(0xffffff, 1.5)
    this._threeJsBase.scene.add(light)

    const directionalLight = new DirectionalLight(0xffffff, 25.5)
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
