import { ResourcesLoader } from '@/core/managers/resources-loader'
import { ModelsResources } from '@/core/managers/models-resources'
import { TexturesResources } from '@/core/managers/textures-resources'
import { ArchiveExtractor } from '@/core/managers/archive-extractor'
import type { WebGLRenderer } from 'three'

export class ResourceLoader {
  public async load(renderer: WebGLRenderer): Promise<void> {
    ResourcesLoader.initKTX2Loader(renderer)
    const loader = ResourcesLoader.getInstance()

    loader.loaderManager.onProgress = (item, loaded, total) => {
      console.log('Loaded:', loaded, 'Total:', total, 'Item:', item)
      //console.log((total / 1) * 100);
    }

    await this.loadModelResources(loader)
    //await this.loadTextureResources(loader)
  }

  private async loadModelResources(loader: ResourcesLoader) {
    const archivePath = './models/models.zip'
    const extractor = new ArchiveExtractor(archivePath)

    try {
      await extractor.extract()

      for (const file in extractor.files) {
        const fileContent = extractor.getFileContent(file)
        const blob = new Blob([fileContent])
        const url = URL.createObjectURL(blob)
        const model = await loader.parseGLTFModel(fileContent.buffer, url)
        ModelsResources.set(file.split('.')[0], model)
      }
    } catch (error: unknown) {
      // @ts-expect-error Тип ошибки не определен
      console.error(error.message)
    }
  }

  private async loadTextureResources(loader: ResourcesLoader) {
    const archivePath = './textures/textures.zip'
    const extractor = new ArchiveExtractor(archivePath)

    try {
      await extractor.extract()

      for (const file in extractor.files) {
        const fileContent = extractor.getFileContent(file)
        const blob = new Blob([fileContent])
        const url = URL.createObjectURL(blob)
        const texture = await loader.loadTexture(url)
        TexturesResources.set(file.split('.')[0], texture)
      }
    } catch (error: unknown) {
      // @ts-expect-error Тип ошибки не определен
      console.error(error.message)
    }
  }
}
