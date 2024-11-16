import { unzipSync } from 'fflate'

export class ArchiveExtractor {
  private _files: Record<string, Uint8Array> = {}

  get files() {
    return this._files
  }

  constructor(private archiveUrl: string) {}

  async extract(retries: number = 5, delay: number = 1000): Promise<void> {
    let attempt = 0
    let success = false
    let response: Response

    while (attempt < retries && !success) {
      try {
        response = await fetch(this.archiveUrl)
        if (!response.ok) {
          throw new Error(`Не удалось загрузить архив: ${response.statusText}`)
        }
        success = true // Если загрузка успешна, выходим из цикла
      } catch (error) {
        attempt++
        console.warn(`Попытка ${attempt} не удалась: ${(error as Error).message}`)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay)) // Ждем перед повторной попыткой
        } else {
          throw new Error(`Не удалось загрузить архив после ${retries} попыток`)
        }
      }
    }
    // @ts-expect-error Типизация fetch не содержит метода arrayBuffer
    const archiveData = new Uint8Array(await response.arrayBuffer())
    this._files = unzipSync(archiveData)
  }

  getFileContent(fileName: string): Uint8Array {
    // Получаем содержимое файла из распакованных данных
    const fileData = this._files[fileName]
    if (!fileData) {
      throw new Error(`File ${fileName} not found in archive.`)
    }
    return fileData
  }
}
