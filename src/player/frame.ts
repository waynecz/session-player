import { Record } from '@waynecz/ui-recorder/dist/models/observers';
import Player from 'player';
import ObserverPattern from './observer';

export interface Frame {
  0: number;
  1: number;
  __st__?: number;
}

export type Frames = Frame[];

class FrameWorkerClass extends ObserverPattern {
  public frames: Frame[] = [];
  public duration: number = 0;
  public firstFrameTime: number = 0;

  public loadFrames(records: Record[]): Frames {
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

    this.firstFrameTime = records[1].t!;

    this.duration = frames[frames.length - 1].__st__! - this.firstFrameTime;

    this.$emit('load', this.duration, this.firstFrameTime);

    return frames;
  }
}

const FrameWorker = new FrameWorkerClass();

export default FrameWorker;
