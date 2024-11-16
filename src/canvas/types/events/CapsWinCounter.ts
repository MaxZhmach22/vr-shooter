import { EventBase } from '@/core/utils/pub-sub'

export class CapsWinCounter extends EventBase {
  constructor(public caps: number) {
    super(caps)
  }
}
