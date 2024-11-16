import type { Vector3 } from 'three'

export interface IPostProcessingOpt {
  enabled: boolean
  colorCorrection: IColorCorrectionOpt
  vignette: {
    enabled: boolean
    darkness: number
    offset: number
  }
}

export interface IColorCorrectionOpt {
  enabled: boolean
  powRGB: Vector3
  mulRGB: Vector3
  addRGB: Vector3
}
