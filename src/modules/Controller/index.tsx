import React from 'react';
import BEMProvider from 'tools/bem-classname';
import Button from 'components/Button';
import Player from 'player';

import {
  usePlayerDuration,
  usePlayerCurrentTime,
  usePlayerStatus
} from 'player/hooks';
import { _ms2Duration } from 'tools/utils';
import Store, { useStoreState } from 'stores';

const bem = BEMProvider('controller');

export default function Controller() {
  const { duration } = usePlayerDuration();

  const currentTime = usePlayerCurrentTime();
  const {
    inited,
    playing,
    framesReady,
    initialDomReady,
    over,
    jumping
  } = usePlayerStatus();

  const fullScreen = useStoreState('fullScreen');

  const hanldeNormalSpeedClick = () => {
    over ? Player.replay() : playing ? Player.pause() : Player.play();
  };

  const allowInteractive = inited && framesReady && initialDomReady;

  const timeIndicator = `${_ms2Duration(currentTime)} / ${_ms2Duration(
    duration
  )}`;

  let percent = Math.floor((currentTime * 100) / (duration || 1));

  if (percent > 100) percent = 100;

  return (
    <section {...bem('$B lr-center', { full: fullScreen })}>
      <div
        {...bem('::progress', { jumping })}
        style={{ '--percent': `${percent}%` } as any}
        onClick={handleJump}
      >
        <div {...bem('::button')} />
      </div>

      <p {...bem('::time')}>{timeIndicator}</p>

      <div {...bem('::actions lr-center')}>
      <Button
          dark={fullScreen}
          icon={over ? 'replay' : playing ? 'pause' : 'play'}
          disabled={!allowInteractive}
          onClick={hanldeNormalSpeedClick}
        />

        <Button
          dark={fullScreen}
          icon={fullScreen ? 'fullscreen_exit' : 'fullscreen'}
          disabled={!allowInteractive}
          onClick={() => Store.setFullScreen(!fullScreen)}
        />

        {/* <Button
          icon="fast_forward"
          disabled={playing || !allowInteractive || over}
          onClick={_ => Player.fastForward()}
        /> */}
      </div>
    </section>
  );
}

async function handleJump(evt) {
  const { pageX, target } = evt as MouseEvent;
  const targetX = target as HTMLDivElement;

  const percent =
    (pageX - targetX.getBoundingClientRect().left) / targetX.offsetWidth;

  await Player.jump(percent);
}
