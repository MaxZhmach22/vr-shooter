import { Group, Mesh, MeshStandardMaterial, type Object3DEventMap } from 'three'
import { ModelsResources } from '@/core/managers/models-resources'
import { Layers } from '@/canvas/types/enums/layers'

export class LevelView extends Group {
  private readonly _floor: Mesh
  private readonly _obstacles: Mesh
  private readonly _walls: Mesh

  get floor() {
    return this._floor
  }

  get obstacles() {
    return this._obstacles
  }

  get walls() {
    return this._walls
  }

  constructor() {
    super()
    const model = ModelsResources.get('level')!.scene
    this._floor = this.initFloor(model)
    this._obstacles = this.initObstacles(model)
    this._walls = this.initWalls(model)
  }

  private initFloor(model: Group<Object3DEventMap>): Mesh {
    const floor = model.getObjectByName('floor') as Mesh
    floor.material = new MeshStandardMaterial({ color: '#5a5a5a', wireframe: false })
    floor.layers.enable(Layers.Floor)
    this.add(floor)
    return floor
  }

  private initObstacles(model: Group<Object3DEventMap>) {
    const obstacles = model.getObjectByName('obstacles') as Mesh
    obstacles.material = new MeshStandardMaterial({ color: '#a1a1a1', wireframe: false })
    obstacles.layers.enable(Layers.Obstacle)
    this.add(obstacles)
    return obstacles
  }

  private initWalls(model: Group<Object3DEventMap>) {
    const walls = model.getObjectByName('walls') as Mesh
    walls.material = new MeshStandardMaterial({ color: '#c3c3c3', wireframe: false })
    this.add(walls)
    return walls
  }
}
