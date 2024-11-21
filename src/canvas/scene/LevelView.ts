import {
  Group,
  Mesh,
  MeshStandardMaterial,
  type Object3DEventMap,
  SphereGeometry,
} from 'three'
import { ModelsResources } from '@/core/managers/models-resources'
import { Layers } from '@/canvas/types/enums/layers'
import type { IWorld } from '@/core/interfaces/IWorld'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d'

export class LevelView extends Group {
  private readonly _floor: Mesh
  private readonly _obstacles: Mesh
  private readonly _walls: Mesh
  private readonly _ball: Mesh

  get floor() {
    return this._floor
  }

  get obstacles() {
    return this._obstacles
  }

  get walls() {
    return this._walls
  }

  constructor(private readonly _world: IWorld) {
    super()
    const model = ModelsResources.get('level')!.scene
    this._floor = this.initFloor(model)
    this._obstacles = this.initObstacles(model)
    this._walls = this.initWalls(model)
    this._ball = this.createBall()
  }

  private initFloor(model: Group<Object3DEventMap>): Mesh {
    const floor = model.getObjectByName('floor') as Mesh
    floor.material = new MeshStandardMaterial({ color: '#5a5a5a', wireframe: false })
    floor.layers.set(Layers.Floor)
    floor.layers.enable(Layers.Camera)

    const floorRigidBody = this._world.world.createRigidBody(
      RigidBodyDesc.fixed().setTranslation(0, 0, 0).setCcdEnabled(true).setCanSleep(true),
    )
    const float32Array = new Float32Array(floor.geometry.attributes.position.array)
    const uint32Array = new Uint32Array(floor.geometry.index!.array)
    const floorShape = ColliderDesc.trimesh(float32Array, uint32Array)
    this._world.world.createCollider(floorShape, floorRigidBody)
    this.add(floor)
    return floor
  }

  private initObstacles(model: Group<Object3DEventMap>) {
    const obstacles = model.getObjectByName('obstacles') as Mesh
    obstacles.material = new MeshStandardMaterial({ color: '#a1a1a1', wireframe: false })
    obstacles.layers.set(Layers.Obstacle)
    obstacles.layers.enable(Layers.Camera)

    const obstaclesRigidBody = this._world.world.createRigidBody(
      RigidBodyDesc.fixed().setTranslation(0, 0, 0).setCcdEnabled(true).setCanSleep(true),
    )

    const float32Array = new Float32Array(obstacles.geometry.attributes.position.array)
    const uint32Array = new Uint32Array(obstacles.geometry.index!.array)
    const obstaclesShape = ColliderDesc.trimesh(float32Array, uint32Array)
    this._world.world.createCollider(obstaclesShape, obstaclesRigidBody)

    this.add(obstacles)
    return obstacles
  }

  private initWalls(model: Group<Object3DEventMap>) {
    const walls = model.getObjectByName('walls') as Mesh
    walls.material = new MeshStandardMaterial({ color: '#c3c3c3', wireframe: false })
    walls.layers.set(Layers.Walls)
    walls.layers.enable(Layers.Camera)

    const wallsRigidBody = this._world.world.createRigidBody(
      RigidBodyDesc.fixed().setTranslation(0, 0, 0).setCcdEnabled(true).setCanSleep(true),
    )

    const float32Array = new Float32Array(walls.geometry.attributes.position.array)
    const uint32Array = new Uint32Array(walls.geometry.index!.array)
    const wallsShape = ColliderDesc.trimesh(float32Array, uint32Array)
    this._world.world.createCollider(wallsShape, wallsRigidBody)

    this.add(walls)
    return walls
  }

  private createBall(): Mesh {
    const sphereGeometry = new SphereGeometry(0.5, 32, 32)
    const material = new MeshStandardMaterial({ color: '#ff0000', wireframe: false })
    const ball = new Mesh(sphereGeometry, material)
    ball.layers.set(Layers.Ball)
    ball.layers.enable(Layers.Camera)

    const ballRigidBody = this._world.world.createRigidBody(
      RigidBodyDesc.dynamic().setTranslation(0, 2, 0).setCcdEnabled(true).setCanSleep(true),
    )

    const ballShape = ColliderDesc.ball(0.5)
    ballShape.setRestitution(0.5)
    ballShape.setFriction(0.2)
    this._world.world.createCollider(ballShape, ballRigidBody)
    this._world.addDynamicObject({ rigidBody: ballRigidBody, object: ball })

    this.add(ball)
    return ball
  }
}
