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
  public jumping = false;
  public over = false;
  public inited = false;
  public framesReady: boolean = false;
  private recordPainting: boolean = false;

  // timing related
  private currentFrameIndex: number = 0;
  private playTimerId: any;
  private lastPlayTime: number;
  private lastPlayFrameTime: number;

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

    this.lastPlayTime = _now();
    this.lastPlayFrameTime = FrameWorker.frames[this.currentFrameIndex].__st__!;

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

  public async replay() {
    this.over = false;
    await DocumentBufferer.reset();
    Painter.clearMouseClick();
    Painter.clearMouseMove();

    this.currentFrameIndex = 0;
    this.$emit('playing', FrameWorker.frames[0]);
    this.play();
  }

  public async jump(percent: number) {
    if (percent * 100 < 100) {
      this.over = false;
    }
    this.jumping = true;
    this.$emit('jumpstart');

    let playingStatusBeforeJump = this.playing;

    if (playingStatusBeforeJump) this.pause();

    const { currentFrameIndex } = this;

    const targetFrameIndex = ~~(FrameWorker.frames.length * percent);

    if (targetFrameIndex > currentFrameIndex) {
      try {
        this.quickPlayASliceOfFrames(currentFrameIndex, targetFrameIndex);
      } catch (err) {}
    }

    if (targetFrameIndex < currentFrameIndex) {
      try {
        await this.quickPlayFromTheBegining(targetFrameIndex);
      } catch (err) {}
    }

    this.jumping = false;
    // use setImmediate for trigging dom change
    setTimeout(_ => this.$emit('jumpend'), 0);

    this.currentFrameIndex = targetFrameIndex + 1;
    this.$emit('playing', FrameWorker.frames[targetFrameIndex]);

    playingStatusBeforeJump && this.play();
  }

  private async quickPlayFromTheBegining(to: number): Promise<void> {
    await DocumentBufferer.reset();
    Painter.clearMouseClick();
    Painter.clearMouseMove();

    let quickPlayEndRecordIndex: number = 0;

    for (let i = to; i > 0; i--) {
      const thisFrame = FrameWorker.frames[i];

      if (thisFrame[1]) {
        quickPlayEndRecordIndex = thisFrame[1];
        break;
      }
    }

    if (quickPlayEndRecordIndex) {
      for (let i = 0; i <= quickPlayEndRecordIndex; i++) {
        const record = trail[i];
        Painter.paint(record);
      }
    }
  }

  /**
   * play frames between specific two frame indexs
   * @param from start frame index
   * @param to end frame index
   */
  private quickPlayASliceOfFrames(from: number, to: number): void {
    const { frames } = FrameWorker;
    let quickPlayStartRecordIndex: number = 0;
    let quickPlayEndRecordIndex: number = 0;

    for (let i = from; i < to; i++) {
      const thisFrame = frames[i];
      if (thisFrame[0]) {
        quickPlayStartRecordIndex = thisFrame[0];
        break;
      }
    }

    for (let i = to; i > from; i--) {
      const thisFrame = frames[i];
      if (thisFrame[1]) {
        quickPlayEndRecordIndex = thisFrame[1];
        break;
      }
    }

    if (quickPlayStartRecordIndex && quickPlayEndRecordIndex) {
      for (
        let i = quickPlayStartRecordIndex;
        i <= quickPlayEndRecordIndex;
        i++
      ) {
        const record = trail[i];
        Painter.paint(record);
      }
    }
  }

  public async init({
    mouseLayer,
    clickLayer,
    domLayer,
    domSnapshot,
    canvas
  }: PlayerInitDTO): Promise<void> {
    // Init Painter & DocumentBufferer ...
    Painter.init(mouseLayer, clickLayer, canvas);
    const status = await DocumentBufferer.init(domLayer, domSnapshot);

    if (status) {
      this.inited = true;
    }

    (window as any).Player = this;

    this.$emit('init', this.inited);
  }

  public load() {
    FrameWorker.loadFrames(trail);
    this.framesReady = true;
    this.$emit('framesreadychange', this.framesReady);
  }

  private playFrame1by1 = (): void => {
    const { currentFrameIndex, interval, lastPlayTime } = this;
    const { frames } = FrameWorker;

    // last frame
    if (currentFrameIndex >= frames.length - 1) {
      this.over = true;
      this.$emit('over');

      this.pause();
      return;
    }

    const {
      0: startRecordIndex,
      1: endRecordIndex,
      __ed__: currentFrameEndTime
    } = frames[currentFrameIndex];

    this.recordPainting = true;

    if ((startRecordIndex || startRecordIndex === 0) && endRecordIndex) {
      for (let i = startRecordIndex; i <= endRecordIndex; i++) {
        // ------------------- Paint ---------------------------
        // ------------------- begins --------------------------
        // ------------------- at ------------------------------
        // ------------------- here ----------------------------
        const record = trail[i];
        Painter.paint(record);

        this.$emit('paint', record, frames[currentFrameIndex]);
      }
    }

    this.recordPainting = false;

    this.$emit('playing', frames[currentFrameIndex]);

    /**
     * Due to the setTimeout wouldn't excute in delayTime accurately,
     * we should correct the offset as far as possible
     **/
    const theTimeShouldPassed = currentFrameEndTime! - this.lastPlayFrameTime;
    const theRealTimePassed = _now() - lastPlayTime;
    let correction = theRealTimePassed - theTimeShouldPassed;

    if (correction < 0) {
      correction = 0;
    }

    // move to next frame
    this.currentFrameIndex += 1;
    this.playTimerId = setTimeout(this.playFrame1by1, interval - correction);
  };

  private nextStep() {}
}

const Player = new PlayerClass();

export default Player;
