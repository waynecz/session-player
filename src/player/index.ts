import { Record } from "@waynecz/ui-recorder/dist/models/observers";
import { MyWindow } from "schemas/override";
import { Hooks, PlayerClass, PlayerInitDTO } from "schemas/player";
import { isFunction } from "tools/is";
import { _log, _warn } from "tools/log";
import { _now } from "tools/utils";
import DocBufferer from "./document";
import FrameWorker, { Frames } from "./frame";
import Painter from "./painter";

const trail = require("trail.json");
class Player implements PlayerClass {
  // settings related
  public interval = 60;

  // player status related
  public playing = false;
  public inited = false;

  public records: Record[] = [];
  public frames: Frames = [];
  public framesReady: boolean = false;

  // timing related
  public playTimePoint = 0;
  private CFI: number = 0; // abbreviation of `current frame index`
  private baseTimePoint: number = 0;
  private playTimerId: any;
  private lastStartTime: number;

  // painting layer related

  // hooks related
  private queues: Map<Hooks, Function[]> = new Map();

  // -------------------------  Start play ---------------------------------- //
  public play(): void {
    if (!this.framesReady) {
      _warn("frames not ready!");
      return;
    }
    this.lastStartTime = _now();
    console.time("Play-duration");
    this.playFrame1by1();
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
    domSnapshot
  }: PlayerInitDTO): Promise<PlayerClass> {
    Painter.init(mouseLayer, clickLayer, domLayer);

    const status = await this.getDocumentReady(domSnapshot);

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
    const { CFI, frames, interval } = this;

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
      // *------------------- Paint ------------------------------
      // *------------------- begins ----------------------------
      // *------------------- at -------------------------------
      // *------------------- here ----------------------------
      this.paint(trail[i]);
    }

    /**
     * Due to the setTimeout wouldn't excute in delayTime accurately,
     * we should correct the offset as far as possible
     **/
    const theTimeShouldPassed = currentFrameStartTime! - frames[0].__st__!;
    const theRealTimePassed = _now() - this.lastStartTime;
    const correction = theRealTimePassed - theTimeShouldPassed;

    // move to next frame
    this.CFI += 1;
    this.playTimerId = setTimeout(this.playFrame1by1, interval - correction);
  };

  private nextStep() {}

  private paint(record): void {
    const recordType2Action = {
      move: this.paintMouseMove,
      click: this.paintMouseClick,
      attr: this.paintDOMMutation,
      node: this.paintDOMMutation,
      text: this.paintDOMMutation,
      form: this.paintFormChange,
      resize: this.paintResize,
      scroll: this.paintScroll,
      default: () => {}
    };

    const { type } = record;

    const actionName = Object.keys(recordType2Action).includes(type)
      ? type
      : "default";

    // distribute action by different type
    recordType2Action[actionName](record);
  }

  private paintMouseMove(): void {}
  private paintMouseClick(): void {}
  private paintDOMMutation(): void {}
  private paintFormChange(): void {}
  private paintResize(): void {}
  private paintScroll(): void {}

  private getDocumentReady(domSnapshot: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const playerDocument = this.domLayer.contentDocument;

      if (!playerDocument) {
        reject(false);
        return;
      }

      try {
        // requestIdleCallback require very new verisons of Chrome, Firefox
        // more: http://mdn.io/requestIdleCallback
        (window as MyWindow).requestIdleCallback(() => {
          playerDocument.write(`<!DOCTYPE html>${domSnapshot}`);

          const noscript = playerDocument.querySelector("noscript");

          if (noscript) {
            noscript.style.display = "none";
          }

          DocBufferer.init(playerDocument);

          resolve(true);
        });
      } catch (err) {
        // TODO: render failed message to Screen
        reject(err);
      }
    });
  }
}

export default new Player();
