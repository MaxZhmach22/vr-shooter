import { CompressedTexture, Texture } from 'three'
import type { TexturesAssets } from '@/canvas/types/enums/texturesAssets'

export const TexturesResources = new Map<TexturesAssets | string, Texture>()

export const CubeTexturesResources = new Map<TexturesAssets, CompressedTexture>()
