import { injectable } from 'inversify'
import type { IGameStateService } from '@/canvas/types/interfaces/IGameStateService'
import { Subject } from 'rxjs'
import { GameState } from '@/canvas/types/enums/gameState'

@injectable()
export class GameStateService implements IGameStateService {
  public currentState = GameState.ReadyForGame
  public onChangeState = new Subject<GameState>()

  public changeState(newState: GameState) {
    // @ts-expect-error - TS2322: Type 'GameState' is not assignable to type 'GameState'.
    console.log('GameState:', GameState[newState as keyof typeof GameState])
    this.currentState = newState
    this.onChangeState.next(newState)
  }
}
