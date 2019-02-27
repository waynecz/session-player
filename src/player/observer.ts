import { isFunction } from 'tools/is'

enum PlayerHooks {
  init,
  jumpstart,
  jumpend,
  framesready,
  domready,
  pause,
  play,
  over,
  paint,
  playing
}

// simple obserser pattern implement
export default class ObserverPatter {
  private queues: Map<string, Function[]> = new Map()

  public $on(hooks: string, action: Function): void {
    const { queues } = this
    const hooksArr = hooks.split(' ')
    hooksArr.forEach(hook => {
      const existingQ = queues.get(hook) || []
      queues.set(hook, [...existingQ, action])
    })
  }

  public $off(hook: string, thisAction: Function): void {
    const Q = this.queues.get(hook) || []
    if (!Q.length) {
      return
    }

    const index = Q.indexOf(thisAction)

    if (index !== -1) {
      Q.splice(index, 1)
      this.queues.set(hook, Q)
    }
  }

  public $emit(hook: string, ...args) {
    const Q = this.queues.get(hook) || []
    if (!Q.length) {
      return
    }

    Q.forEach(action => {
      if (isFunction(action)) {
        action(...args)
      }
    })
  }
}
