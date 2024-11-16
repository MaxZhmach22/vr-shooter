import type { GLTFModels } from '@/canvas/types/enums/gLTFModels'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

export const ModelsResources = new Map<GLTFModels | string, GLTF>()
