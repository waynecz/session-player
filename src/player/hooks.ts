import { useState } from 'react';
import FrameWorker, { Frame } from './frame';
import Player from 'player';
import { _throttle } from 'tools/utils';


// --------------------------- usePlayDuration --------------------------
export function usePlayDuration(): { duration: string; ms: number } {
  const [time, setTime] = useState('0:00');
  let ms = 0;

  FrameWorker.$on('load', (duration: number) => {
    ms = duration;
    duration = ~~(duration / 1000);
    const MM = ~~(duration / 60);
    const SS = duration % 60;
    setTime(`${MM}:${SS < 10 ? '0' + SS : SS}`);
  });

  return {
    duration: time,
    ms
  };
}

// --------------------------- usePlayingTimeChange --------------------------
let currentFrame: Frame;
let setPlayedDuration: any
let playedDurationMS: number

Player.$on('play', _throttle((frame: Frame) => {
  currentFrame = frame;
  onplay()
}, 1000))

function onplay() {
  const { __st__: thisFrameStartTime } = currentFrame;

  playedDurationMS = thisFrameStartTime! - FrameWorker.firstFrameTime;

  const playedDuration = ~~(playedDurationMS / 1000)
  const MM = ~~(playedDuration / 60);
  const SS = playedDuration % 60;

  setPlayedDuration && setPlayedDuration(`${MM}:${SS < 10 ? '0' + SS : SS}`)
}

export function usePlayingTimeChange() {
  const [playedDuration, setTime] = useState('0:00');
  setPlayedDuration = setTime

  return {
    playedDuration,
    ms: playedDurationMS
  }
}
