import { Player, PlayerInitDTO } from 'schemas/player';
import { _log, _warn, _error } from 'tools/log';
import { _now, _sleep } from 'tools/utils';
import DomTreeBufferer from './dom-bufferer';
import FrameWorker from './frame';
import Painter from './painter';
import ObserverPattern from './observer';
import { myWindow } from 'schemas/override';
import Store from 'stores';

class PlayerClass extends ObserverPattern implements Player {
  // settings related
  public INTERVAL = 60;

  // player status related
  public playing = false;
  public jumping = false;
  public over = false;
  public inited = false;
  public framesReady: boolean = false;
  public initialDomReady: boolean = false;

  public recordPainting: boolean = false;

  // timing related
  private currentFrameIndex: number = 0;
  private playTimerId: any;
  private lastPlayTime: number;
  private lastPlayFrameStartTime: number;

  public play = (): boolean => {
    if (!this.inited) {
      _warn("Player hasn't been initiated or DOMTreeBufferer initiate failed!");
      return false;
    }

    if (!this.framesReady) {
      _warn('frames not ready!');
      return false;
    }

    this.lastPlayTime = _now();
    this.lastPlayFrameStartTime = FrameWorker.frames[
      this.currentFrameIndex
    ].__st__!;

    setImmediate(this.playFrame1by1);
    this.playing = true;
    this.$emit('play');

    return true;
  }

  public fastForward = () => {
    this.pause();

    this.INTERVAL = 30;

    setImmediate(this.play);
  }

  public pause = () => {
    clearTimeout(this.playTimerId);
    this.playing = false;
    setImmediate(_ => this.$emit('pause'));
  }

  public async replay() {
    this.over = false;
    await DomTreeBufferer.reload();

    this.currentFrameIndex = 0;
    // in order to refresh player current time
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

    if (playingStatusBeforeJump) {
      this.pause();
    }

    const { currentFrameIndex } = this;

    const targetFrameIndex = ~~(FrameWorker.frames.length * percent);

    if (targetFrameIndex > currentFrameIndex) {
      try {
        this.quickPlayASliceOfFrames(currentFrameIndex, targetFrameIndex);
      } catch (err) {
        _error('​catch -> err', err);
      }
    }

    if (targetFrameIndex < currentFrameIndex) {
      try {
        await this.quickPlayFromTheBegining(targetFrameIndex);
      } catch (err) {
        _error('​catch -> err', err);
      }
    }

    this.currentFrameIndex = targetFrameIndex + 1;

    playingStatusBeforeJump && this.play();

    this.jumping = false;
    // use setImmediate in order to trigger dom change
    // and refresh player current time
    setImmediate(_ =>
      this.$emit('jumpend', FrameWorker.frames[targetFrameIndex])
    );
  }

  private async quickPlayFromTheBegining(to: number): Promise<void> {
    await DomTreeBufferer.reload();

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
        const record = Store.recordList[i];
        Painter.paint(record);
      }
    }
  }

  /**
   * play frames between two specified frame-index
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
        const record = Store.recordList[i];
        Painter.paint(record);
      }
    }
  }

  public async init({
    mouseLayer,
    screen,
    domLayer,
    canvas
  }: PlayerInitDTO): Promise<void> {
    myWindow.Player = this;
    Painter.init(domLayer, mouseLayer, canvas, screen);
    this.inited = true;
    this.$emit('init', this.inited);
  }

  /**
   * Load external data, make trail turn to frames,
   * render initialPageSnapshot to real DOM
   * @param trail
   * @param initialPageSnapshot
   * @param domLayer
   */
  public loadRecorderData({ recordList, initialPageSnapshot, referer }) {
    if (!this.inited) {
      return _warn('can not loadTheRecordData before Player inited!');
    }

    DomTreeBufferer.fillTheDomLayerBySnapshot(
      Painter.domLayer,
      initialPageSnapshot,
      referer
    ).then(_ => {
      this.initialDomReady = true;
      this.$emit('domready', this.framesReady);
      this.play();
    });

    FrameWorker.loadFrames(recordList);

    this.framesReady = true;
    this.$emit('framesready', this.framesReady);
  }

  private playFrame1by1 = (): void => {
    const { currentFrameIndex, INTERVAL, lastPlayTime } = this;
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
        const record = Store.recordList[i];
        Painter.paint(record);

        this.$emit('paint', i);
      }
    }

    this.recordPainting = false;

    this.$emit('playing', frames[currentFrameIndex]);

    /**
     * ⚠️ Due to the setTimeout wouldn't excute in delayTime accurately,
     * we should correct the offset as far as possible
     */
    const theTimeShouldPassed =
      currentFrameEndTime! - this.lastPlayFrameStartTime;
    const theRealTimePassed = _now() - lastPlayTime;
    let correction = theRealTimePassed - theTimeShouldPassed;

    if (correction < 0) {
      correction = 0;
    }

    // move to next frame
    this.currentFrameIndex += 1;
    this.playTimerId = setTimeout(this.playFrame1by1, INTERVAL - correction);
  };

  public nextStep() {
    // TODO
  }
}

const Player = new PlayerClass();

export default Player;
