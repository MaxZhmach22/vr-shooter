import type { IWorld } from '@/core/interfaces/IWorld'
import { RigidBody, Vector3, World } from '@dimforge/rapier3d'
import { type InstancedMesh, Quaternion, Vector3 as Vec3 } from 'three'
import type { IUpdate } from '@/core/interfaces/IUpdate'
import { Matrix4, type Object3D } from 'three'
import type GUI from 'lil-gui'
import { findGUIFolder } from '@/core/utils/utils'
import type { IWorldPhysicsOpt } from '@/canvas/types/interfaces/IWorldPhysicsOpt'
import { clamp } from 'three/src/math/MathUtils'
import type { IGameStateService } from '@/canvas/types/interfaces/IGameStateService'
import { GameState } from '@/canvas/types/enums/gameState'
import type { ICap } from '@/canvas/types/interfaces/ICap'

export class WorldInitializer implements IWorld, IUpdate {
  private translation: Vector3 = new Vector3(0, 0, 0)

  private instancedData = {
    translation: new Vec3(0, 0, 0),
    rotation: new Quaternion(0, 0, 0, 0),
    scale: new Vec3(1, 1, 1),
  }

  private tempMatrix = new Matrix4()

  public world: World
  public dynamicBodies: Map<number, { object: Object3D; rigidBody: RigidBody }> = new Map()

  public instancedBodies: Map<
    number,
    {
      cap: ICap
      mesh: InstancedMesh
      matrix: Matrix4
      rigidBody: RigidBody
    }
  > = new Map()

  getDynamicObjects(id: number): { object: Object3D; rigidBody: RigidBody } {
    if (!this.dynamicBodies.has(id)) {
      throw new Error(`Dynamic object with id ${id} not found`)
    }
    return this.dynamicBodies.get(id)!
  }

  getInstancedObject(id: number): {
    cap: ICap
    mesh: InstancedMesh
    matrix: Matrix4
    rigidBody: RigidBody
  } {
    if (!this.instancedBodies.has(id)) {
      throw new Error(`Instanced object with id ${id} not found`)
    }
    return this.instancedBodies.get(id)!
  }

  getAllInstancedObjects() {
    return this.instancedBodies
  }

  constructor(
    private readonly gui: GUI,
    private readonly physicsOpt: IWorldPhysicsOpt,
    private readonly gameStateService: IGameStateService,
  ) {
    this.world = new World(physicsOpt.gravity)
    this.world.integrationParameters.maxCcdSubsteps = physicsOpt.ccdIterations
    this.world.integrationParameters.dt = physicsOpt.timeStep
    this.world.integrationParameters.normalizedAllowedLinearError = physicsOpt.allowed_linear_error
    this.addDebug()
  }

  public addDynamicObject(data: { object: Object3D; rigidBody: RigidBody }): void {
    this.dynamicBodies.set(data.object.id, data)
  }

  public addInstancedObject(data: {
    cap: ICap
    mesh: InstancedMesh
    matrix: Matrix4
    rigidBody: RigidBody
  }): void {
    this.instancedBodies.set(data.cap.id, data)
  }

  public update(deltaTime: number): void {
    this.world.timestep = Math.min(deltaTime, 0.1)
    this.world.step()

    this.dynamicBodies.forEach((dynamicObject) => {
      this.translation = dynamicObject.rigidBody.translation()
      this.translation.y = clamp(this.translation.y, 0, 20)
      dynamicObject.rigidBody.setTranslation(this.translation, false)
      dynamicObject.object.position.copy(dynamicObject.rigidBody.translation())
      dynamicObject.object.quaternion.copy(dynamicObject.rigidBody.rotation())
    })

    this.instancedBodies.forEach((instancedObject) => {
      this.translation = instancedObject.rigidBody.translation()
      this.translation.y = clamp(
        this.translation.y,
        this.gameStateService.currentState === GameState.CapsUp
          ? instancedObject.cap.startPosition
          : 0,
        20,
      )
      instancedObject.rigidBody.setTranslation(this.translation, false)
      this.instancedData.translation.copy(instancedObject.rigidBody.translation())
      this.instancedData.rotation.copy(instancedObject.rigidBody.rotation())
      this.tempMatrix = instancedObject.matrix.compose(
        this.instancedData.translation,
        this.instancedData.rotation,
        this.instancedData.scale,
      )
      instancedObject.mesh.setMatrixAt(instancedObject.cap.id, this.tempMatrix)
      instancedObject.mesh.instanceMatrix.needsUpdate = true
    })
  }

  private addDebug() {
    const physicsFolder = findGUIFolder(this.gui, 'Physics')
    const worldFolder = physicsFolder.addFolder('World')
    worldFolder.add(this.physicsOpt.gravity, 'y', -50, 50).onChange(() => {
      this.world.gravity = this.physicsOpt.gravity
    })
    worldFolder
      .add(this.physicsOpt, 'ccdIterations', 1, 10)
      .step(1)
      .onChange(() => {
        this.world.integrationParameters.maxCcdSubsteps = this.physicsOpt.ccdIterations
      })
    worldFolder
      .add(this.physicsOpt, 'timeStep', 0.001, 0.1)
      .step(0.001)
      .onChange(() => {
        this.world.integrationParameters.dt = this.physicsOpt.timeStep
      })
    worldFolder
      .add(this.physicsOpt, 'allowed_linear_error', 0.0001, 0.1)
      .step(0.0001)
      .onChange(() => {
        this.world.integrationParameters.normalizedAllowedLinearError =
          this.physicsOpt.allowed_linear_error
      })
    worldFolder.close()
  }
}
