import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export interface IThreeJsBase {
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  scene: Scene
}
