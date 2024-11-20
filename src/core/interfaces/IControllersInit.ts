import type { IVRController } from '@/core/interfaces/IVRController'

export interface IControllersInit {
  initControllers(mainController: IVRController, supportController: IVRController): void
}
