import { Record } from "@waynecz/ui-recorder/dist/models/observers";
import { Hooks, PlayerClass, PlayerInitDTO } from "schemas/player";
import { isFunction } from "tools/is";
import { _log, _warn } from "tools/log";
import { _now } from "tools/utils";
import DocumentBufferer from "./document";
import FrameWorker, { Frames } from "./frame";
import Painter from "./painter";

const trail = require("trail.json");
class Player implements PlayerClass {
  // settings related
  public interval = 100;

  // player status related
  public playing = false;
  public inited = false;

  public records: Record[] = [];
  public frames: Frames = [];
  public framesReady: boolean = false;

  // timing related
  public playTimePoint = 0;
  private CFI: number = 0; // abbreviation of `current frame index`
  private playTimerId: any;
  private lastStartTime: number;

  // hooks related
  private queues: Map<Hooks, Function[]> = new Map();

  // -------------------------  Start play ---------------------------------- //
  public play(): boolean {
    if (!this.inited) {
      _warn("Player hasn't initiated or document-bufferer initiate failed!");
      return false;
    }
    
    if (!this.framesReady) {
      _warn("frames not ready!");
      return false;
    }

    this.lastStartTime = _now();
    console.time("Play-duration");

    setImmediate(this.playFrame1by1);

    return true;
  }

  public pause() {
    clearTimeout(this.playTimerId);
  }

  public jump(time: number) {}

  public $on(hook: Hooks, action: Function) {
    const { queues } = this;
    const existingQ = queues.get(hook) || [];

    queues.set(hook, [...existingQ, action]);
  }
  public $off(hook: Hooks, thisAction: Function) {
    const Q = this.queues.get(hook) || [];
    if (!Q.length) {
      return;
    }

    const index = Q.indexOf(thisAction);

    if (index !== -1) {
      Q.splice(index, 1);
      this.queues.set(hook, Q);
    }
  }
  public $emit(hook: Hooks) {
    const Q = this.queues.get(hook) || [];
    if (!Q.length) {
      return;
    }

    Q.forEach(action => {
      if (isFunction(action)) {
        action();
      }
    });
  }

  /** Init Player */
  public async init({
    mouseLayer,
    clickLayer,
    domLayer,
    domSnapshot,
    canvas
  }: PlayerInitDTO): Promise<PlayerClass> {
    // Init Painter & DocumentBufferer ...
    Painter.init(mouseLayer, clickLayer, domLayer, canvas);
    const status = await DocumentBufferer.init(domLayer, domSnapshot);

    if (status) {
      this.inited = true;
    }

    (window as any).Player = this;

    return this;
  }

  public loadRecords() {
    this.frames = FrameWorker.createFrames(trail);
    this.framesReady = true;
  }

  private playFrame1by1 = (): void => {
    const { CFI, frames, interval, lastStartTime } = this;
    if (CFI >= frames.length - 1) {
      console.timeEnd("Play-duration");

      this.pause();
      return;
    }

    const {
      0: startRecordIndex,
      1: endRecordIndex,
      __st__: currentFrameStartTime
    } = frames[CFI];

    for (let i = startRecordIndex; i <= endRecordIndex; i++) {
      // *------------------- Paint ---------------------------
      // *------------------- begins --------------------------
      // *------------------- at ------------------------------
      // *------------------- here ----------------------------
      Painter.paint(trail[i]);
    }

    /**
     * Due to the setTimeout wouldn't excute in delayTime accurately,
     * we should correct the offset as far as possible
     **/
    const theTimeShouldPassed = currentFrameStartTime! - lastStartTime;
    const theRealTimePassed = _now() - lastStartTime;
    const correction = theRealTimePassed - theTimeShouldPassed;

    // move to next frame
    this.CFI += 1;
    this.playTimerId = setTimeout(this.playFrame1by1, interval - correction);
  };

  private nextStep() {}
}

export default new Player();
