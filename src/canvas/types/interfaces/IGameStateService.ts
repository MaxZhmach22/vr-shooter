import { GameState } from '@/canvas/types/enums/gameState'
import { Subject } from 'rxjs'

export interface IGameStateService {
  currentState: GameState
  changeState(newState: GameState): void
  onChangeState: Subject<GameState>
}
