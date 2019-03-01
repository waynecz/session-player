import { useState, useEffect, useCallback } from 'react';
import FrameWorker, { Frame } from './frame';
import Player from 'player';
import { _throttle } from 'tools/utils';

export function usePlayerStatus(): {
  inited: boolean;
  playing: boolean;
  jumping: boolean;
  over: boolean;
  framesReady: boolean;
  initialDomReady: boolean;
} {
  const [status, setValue] = useState({
    jumping: false,
    inited: false,
    playing: false,
    over: false,
    framesReady: false,
    initialDomReady: false
  });

  const playerStatusHandler = useCallback(() => {
    const {
      inited,
      playing,
      framesReady,
      initialDomReady,
      over,
      jumping
    } = Player;
    setValue({
      jumping,
      over,
      inited,
      playing,
      initialDomReady,
      framesReady
    });
  }, [null]);

  useEffect(() => {
    Player.$on(
      'init jumpstart jumpend framesready domready pause play over',
      playerStatusHandler
    );
  }, []);

  return status;
}

// --------------------------- usePlayerDuration --------------------------
const refreshDuration = (setDuration: any) => {
  return function(duration: number): void {
    setDuration && setDuration(duration);
  };
};

export function usePlayerDuration(): { duration: number } {
  const [duration, setTime] = useState(0);

  const callback = useCallback(refreshDuration(setTime), [null]);

  useEffect(
    () => {
      FrameWorker.$on('load', callback);
    },
    [null]
  );

  return {
    duration: Player.framesReady ? duration : FrameWorker.duration
  };
}

// --------------------------- usePlayerCurrentTime --------------------------
function refreshCurrentTime(setCurrentTime: any): any {
  return function(frame: Frame) {
    const { __ed__ } = frame;

    const currentTime = __ed__! + Player.INTERVAL - FrameWorker.firstFrameTime;

    setCurrentTime && setCurrentTime(currentTime);
  };
}

export function usePlayerCurrentTime(): number {
  const [currentTime, setTime] = useState(0);

  const callback = useCallback(refreshCurrentTime(setTime), [null]);

  useEffect(
    () => {
      Player.$on('jumpend', callback);
      Player.$on('playing', _throttle(callback, 100));
    },
    [null]
  );

  return currentTime;
}

// --------------------------- useCurrentReocrdIndex --------------------------
let setIndex: any;

Player.$on('paint', recordIndex => {
  setIndex && setIndex(recordIndex);
});

export function useCurrentRecordIndex() {
  const [index, setValue] = useState(0);

  setIndex = _throttle(setValue, 300);

  return index;
}
