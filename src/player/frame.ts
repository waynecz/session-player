import { Record } from '@waynecz/ui-recorder/dist/models/observers';
import Player from 'player';

export interface Frame {
  0: number;
  1: number;
  __st__?: number;
}

export type Frames = Frame[];

class FrameWorkerClass {
  public frames: Frame[] = [];
  public duration: number = 0;

  public createFrames(records: Record[]): Frames {
    const frames: Frames = [];
    const timeline = records.map(r => r.t);
    const interval = Player.interval;

    // start, end record's index of this frame
    let s: number = 0;
    let e: number = 0;
    let thisFrameStartTime: number = timeline[0]!;

    timeline.forEach((time, index) => {
      if (time) {
        if (time - thisFrameStartTime < interval) {
          e = index;
        } else if (time - thisFrameStartTime >= interval) {
          const thisFrame: Frame = [s, e];
          thisFrame.__st__ = thisFrameStartTime;

          frames.push(thisFrame);
          s = e = index;
          thisFrameStartTime += interval;
        }
      }
    });

    this.frames = frames;

    this.duration = records[records.length - 1].t! - records[0].t!;

    return frames;
  }
}

const FrameWorker = new FrameWorkerClass();

export default FrameWorker;
