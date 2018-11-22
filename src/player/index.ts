import { Record } from '@waynecz/ui-recorder/dist/models/observers';
import { IPlayerClass, PlayerInitDTO } from 'schemas/player';
import { _log, _warn, _error } from 'tools/log';
import { _now } from 'tools/utils';
import DocumentBufferer from './document';
import FrameWorker from './frame';
import Painter from './painter';
import ObserverPattern from './observer';

const trail: any[] = JSON.parse(window.localStorage.getItem('trail') || '[]');

trail.unshift({ type: 'resize', w: 1440, h: 900, t: 140 });

class PlayerClass extends ObserverPattern implements IPlayerClass {
  // settings related
  public interval = 60;

  // player status related
  public playing = false;
  public inited = false;
  public framesReady: boolean = false;

  // timing related
  private CFI: number = 0; // abbreviation of `current frame index`
  private playTimerId: any;
  private lastStartPlayTime: number;
  private frameStartTimeAtLastPlay: number;

  // -------------------------  Start play ---------------------------------- //
  public play(): boolean {
    if (!this.inited) {
      _warn(
        "Player hasn't been initiated or Document-bufferer initiate failed!"
      );
      return false;
    }

    if (!this.framesReady) {
      _warn('frames not ready!');
      return false;
    }

    this.lastStartPlayTime = _now();
    this.frameStartTimeAtLastPlay = FrameWorker.frames[this.CFI].__st__!;

    setImmediate(this.playFrame1by1);
    this.playing = true;
    this.$emit('play');

    return true;
  }

  public pause() {
    clearTimeout(this.playTimerId);
    this.playing = false;
    this.$emit('pause');
  }

  public jump(percent: number) {
    const nextFrameIndex = ~~(FrameWorker.frames.length * percent);
    console.log("​PlayerClass -> publicjump -> this.CFI", this.CFI)
    this.quickPlayback()
    this.play()
  }

  private quickPlayback() {

  }

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

    this.$emit('init', this.inited);

    return this;
  }

  public load() {
    FrameWorker.loadFrames(trail);
    this.framesReady = true;
    this.$emit('framesreadychange', this.framesReady);
  }

  private playFrame1by1 = (): void => {
    const { CFI, interval, lastStartPlayTime } = this;
    const { frames } = FrameWorker;

    // last frame
    if (CFI >= frames.length - 1) {
      this.$emit('playend');

      this.pause();
      return;
    }

    const {
      0: startRecordIndex,
      1: endRecordIndex,
      __ed__: currentFrameEndTime
    } = frames[CFI];

    if ((startRecordIndex || startRecordIndex === 0) && endRecordIndex) {
      for (let i = startRecordIndex; i <= endRecordIndex; i++) {
        // ------------------- Paint ---------------------------
        // ------------------- begins --------------------------
        // ------------------- at ------------------------------
        // ------------------- here ----------------------------
        const record = trail[i];
        try {
          Painter.paint(record);
        } catch (err) {
          this.pause();
          _log(i);
          _error(err);
        }

        this.$emit('paint', record, frames[CFI]);
      }
    }

    this.$emit('playing', frames[CFI]);

    /**
     * Due to the setTimeout wouldn't excute in delayTime accurately,
     * we should correct the offset as far as possible
     **/
    const theTimeShouldPassed =
      currentFrameEndTime! - this.frameStartTimeAtLastPlay;
    const theRealTimePassed = _now() - lastStartPlayTime;
    let correction = theRealTimePassed - theTimeShouldPassed;

    if (correction < 0) {
      correction = 0;
    }

    // move to next frame
    this.CFI += 1;
    this.playTimerId = setTimeout(this.playFrame1by1, interval - correction);
  };

  private nextStep() {}
}

const Player = new PlayerClass();

export default Player;
