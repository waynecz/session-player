import { useState } from 'react';
import FrameWorker, { Frame } from './frame';
import Player from 'player';
import { _throttle } from 'tools/utils';

let setStatus: any;

function playerStatusHandler(): void {
  const { inited, playing, framesReady, over } = Player;
  setStatus &&
    setStatus({
      over,
      inited,
      playing,
      framesReady
    });
}

Player.$on('init', playerStatusHandler);
Player.$on('framesreadychange', playerStatusHandler);
Player.$on('pause', playerStatusHandler);
Player.$on('play', playerStatusHandler);
Player.$on('over', playerStatusHandler);

export function usePlayerStatus(): {
  inited: boolean;
  playing: boolean;
  over: boolean;
  framesReady: boolean;
} {
  const [status, setValue] = useState({
    inited: false,
    playing: false,
    over: false,
    framesReady: false
  });
  setStatus = setValue;
  return status;
}

// --------------------------- usePlayerDuration --------------------------
let setDuration: any;

FrameWorker.$on(
  'load',
  (duration: number): void => {
    setDuration && setDuration(duration);
  }
);

export function usePlayerDuration(): { duration: number } {
  const [duration, setTime] = useState(0);

  setDuration = setTime;

  return {
    duration
  };
}

// --------------------------- usePlayerCurrentTime --------------------------
let setCurrentTime: any;

// TODO: 修复最开始播放的几秒快速跳过的状况
Player.$on(
  'playing',
  _throttle((frame: Frame): void => {
    const { __ed__ } = frame;

    const currentTime = __ed__! + Player.interval - FrameWorker.firstFrameTime;

    setCurrentTime && setCurrentTime(currentTime);
  }, 1000)
);

export function usePlayerCurrentTime(): { currentTime: number } {
  const [currentTime, setTime] = useState(0);
  setCurrentTime = setTime;

  return {
    currentTime
  };
}
