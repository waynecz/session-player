import Player from 'player'
import ObserverPattern from './observer'
import { myWindow } from 'schemas/override'
import Store from 'stores'

const CRITICAL_ACTION_TYPES = ['beacon', 'xhr', 'fetch', 'console', 'jserr', 'unhandledrejection', 'history']

export type Frame = [
  number?, // start record index
  number? // end record index
] & {
  __st__?: number // this frame start time
  __ed__?: number // this frame end time
}

export type Frames = Frame[]

class FrameWorkerClass extends ObserverPattern {
  public frames: Frames = []
  public duration: number = 0
  public firstFrameTime: number = 0

  public loadFrames(recordList: any[]): void {
    const { INTERVAL } = Player
    // list every time point of records
    const timeline = recordList.map(record => record.t!)
    const recordCount = timeline.length
    const criticalActionIndexs: any[] = []

    this.firstFrameTime = timeline[0]!

    let isLastFrame: boolean = false
    let currentRecordCursor: number = 0
    let currentFrameCursor: number = 0

    while (!isLastFrame) {
      let thisFrame: Frame = []

      let thisFrameStart: number = this.firstFrameTime + currentFrameCursor * INTERVAL
      let thisFrameEnd: number = thisFrameStart + INTERVAL

      thisFrame[0] = currentRecordCursor

      while (timeline[currentRecordCursor] <= thisFrameEnd && currentRecordCursor <= recordCount - 1) {
        // 👇👇👇 Filter out those record are critical actions
        // stroe their index in recordList to an array
        if (CRITICAL_ACTION_TYPES.includes(recordList[currentRecordCursor].type)) {
          criticalActionIndexs.push({ record: currentRecordCursor, frame: currentFrameCursor, time: thisFrameStart })
        }
        currentRecordCursor++
      }

      thisFrame[1] = currentRecordCursor

      if (thisFrame[0] === thisFrame[1]) {
        // if this frame has no record, clear the temporary start record index set before
        thisFrame.length = 0
      }

      thisFrame.__st__ = thisFrameStart
      thisFrame.__ed__ = thisFrameEnd

      this.frames[currentFrameCursor] = thisFrame

      currentFrameCursor++

      if (currentRecordCursor > recordCount - 1) {
        isLastFrame = true
      }
    }

    Store.setCriticalActionIndexs(criticalActionIndexs)

    this.duration = this.frames[this.frames.length - 1].__st__! - this.firstFrameTime

    this.$emit('load', this.duration, this.firstFrameTime)
  }
}

const FrameWorker = new FrameWorkerClass()

myWindow.FrameWorker = FrameWorker

export default FrameWorker
