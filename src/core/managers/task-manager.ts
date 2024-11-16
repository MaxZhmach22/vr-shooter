interface Task {
  ms: number
  resolver: () => void
}

export class TaskManager {
  private static _idCounter: number = 0

  private static resolvers: Map<number, Task> = new Map()

  public static async task(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      TaskManager.resolvers.set(this._idCounter++, {
        ms: ms / 1000,
        resolver: resolve,
      })
    })
  }

  public static update(deltaTime: number) {
    TaskManager.resolvers.forEach((res, id) => {
      res.ms -= deltaTime
      if (res.ms <= 0) {
        res.resolver()
        TaskManager.resolvers.delete(id)
      }
    })
  }
}
