import { Record } from '@waynecz/ui-recorder/dist/models/observers';
import { IPlayerClass, PlayerInitDTO } from 'schemas/player';
import { _log, _warn, _error } from 'tools/log';
import { _now } from 'tools/utils';
import DocumentBufferer from './document';
import FrameWorker from './frame';
import Painter from './painter';
import ObserverPattern from './observer';

const trail: any[] = JSON.parse(window.localStorage.getItem('trail') || '[]');

trail.unshift({ type: 'resize', w: 1440, h: 900, t: 10 });

class PlayerClass extends ObserverPattern implements IPlayerClass {
  // settings related
  public interval = 60;

  // player status related
  public playing = false;
  public inited = false;

  public records: Record[] = [];
  public framesReady: boolean = false;

  // timing related
  public playTimePoint = 0;
  private CFI: number = 0; // abbreviation of `current frame index`
  private playTimerId: any;
  private lastStartTime: number;

  // -------------------------  Start play ---------------------------------- //
  public play(): boolean {
    if (!this.inited) {
      _warn("Player hasn't initiated or Document-bufferer initiate failed!");
      return false;
    }

    if (!this.framesReady) {
      _warn('frames not ready!');
      return false;
    }

    this.lastStartTime = _now();
    console.time('Play-duration');

    setImmediate(this.playFrame1by1);

    return true;
  }

  public pause() {
    clearTimeout(this.playTimerId);
    this.$emit('pause');
  }

  public jump(time: number) {}

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
    FrameWorker.loadFrames(trail);
    this.framesReady = true;
  }

  private playFrame1by1 = (): void => {
    const { CFI, interval, lastStartTime } = this;
    const { frames } = FrameWorker;
    if (CFI >= frames.length - 1) {
      console.timeEnd('Play-duration');

      this.pause();
      return;
    }

    const {
      0: startRecordIndex,
      1: endRecordIndex,
      __st__: currentFrameStartTime
    } = frames[CFI];

    for (let i = startRecordIndex; i <= endRecordIndex; i++) {
      // !------------------- Paint ---------------------------
      // !------------------- begins --------------------------
      // !------------------- at ------------------------------
      // !------------------- here ----------------------------
      const record = trail[i];
      try {
        Painter.paint(record);
      } catch (err) {
        _log(i);
        _error(err);
      }

      this.$emit('paint', record, frames[CFI]);
    }


    this.$emit('play', frames[CFI]);
    
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

const Player = new PlayerClass();

export default Player;
