import { Record } from '@waynecz/ui-recorder/dist/models/observers';
import Player from 'player';
import ObserverPattern from './observer';

export interface Frame {
  0?: number; // start record index
  1?: number; // end record index
  __st__?: number; // this frame start time
  __ed__?: number; // this frame end time
}

export type Frames = Frame[];

class FrameWorkerClass extends ObserverPattern {
  public frames: Frame[] = [];
  public duration: number = 0;
  public firstFrameTime: number = 0;

  public loadFrames(records: Record[]): Frames {
    const frames: Frames = [];
    const timeline = records.map(r => r.t!);
    const count = timeline.length;
    const interval = Player.interval;

    this.firstFrameTime = timeline[0]!;

    let isLastFrame: boolean = false;
    let currentTimeIndex: number = 0;
    let currentFrameIndex: number = 0;

    while (!isLastFrame) {
      let thisFrame: [number?, number?] = [];

      let thisFrameStart: number =
        this.firstFrameTime + currentFrameIndex * interval;
      let thisFrameEnd: number = thisFrameStart + interval;

      thisFrame[0] = currentTimeIndex;

      while (
        timeline[currentTimeIndex] <= thisFrameEnd &&
        currentTimeIndex <= count - 1
      ) {
        thisFrame[1] = currentTimeIndex;
        currentTimeIndex++;
      }

      if (thisFrame.length === 1) {
        // if this frame has no record, clear the temporary start record index set before
        thisFrame.length = 0;
      }

      (thisFrame as Frame).__st__ = thisFrameStart;
      (thisFrame as Frame).__ed__ = thisFrameEnd;

      frames[currentFrameIndex] = thisFrame;
      currentFrameIndex++;

      if (currentTimeIndex > count - 1) {
        isLastFrame = true;
      }
    }

    this.frames = frames;
    
    this.duration = frames[frames.length - 1].__st__! - this.firstFrameTime;

    this.$emit('load', this.duration, this.firstFrameTime);

    return frames;
  }
}

const FrameWorker = new FrameWorkerClass();

export default FrameWorker;
