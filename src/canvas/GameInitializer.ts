import { ResourceLoader } from '@/canvas/loader/ResourceLoader'
import { buildDIContainer } from '@/inversify.config'
import type { IThreeJsBase } from '@/core/interfaces/IThreeJsBase'
import { TYPES } from '@/core/types/types'
import type { IUpdateHandler } from '@/core/interfaces/IUpdateHandler'
import { WebGLRenderer } from 'three'
import type { CameraController } from '@/canvas/camera/CameraController'
import { GAMETYPES } from '@/canvas/types/types'
import type { SceneController } from '@/canvas/scene/SceneController'
import type { InputController } from '@/canvas/input/InputController'

export class GameInitializer {
  private resourcesLoader = new ResourceLoader()

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.init(canvas)
  }

  private async init(canvas: HTMLCanvasElement) {
    const renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })

    await this.resourcesLoader.load(renderer)
    this.buildDIContainer(renderer)
  }

  private buildDIContainer(renderer: WebGLRenderer) {
    const diContainer = buildDIContainer(renderer)
    diContainer.get<IThreeJsBase>(TYPES.ThreeJsBase)
    diContainer.get<IUpdateHandler>(TYPES.UpdateHandler)
    diContainer.get<InputController>(TYPES.InputController)
    diContainer.get<CameraController>(GAMETYPES.CameraController)
    diContainer.get<SceneController>(GAMETYPES.SceneController)
  }
}
