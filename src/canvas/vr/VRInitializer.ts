import { WebGLRenderer } from 'three'

export class VRInitializer {
  private baseReferenceSpace: XRReferenceSpace | null = null

  get referenceSpace() {
    return this.baseReferenceSpace
  }

  constructor(private readonly gl: WebGLRenderer) {
    gl.xr.enabled = true
    this.createSubscriptions()
  }

  private createSubscriptions() {
    this.gl.xr.addEventListener(
      'sessionstart',
      () => (this.baseReferenceSpace = this.gl.xr.getReferenceSpace()),
    )
  }
}
