import React from 'react';
import BEMProvider from 'tools/bem-classname';
import Button from 'components/Button';
import {
  usePlayerDuration,
  usePlayerCurrentTime,
  usePlayerStatus
} from 'player/hooks';
import { _ms2Duration } from 'tools/utils';
import Player from 'player';

export default function Controller() {
  const style = BEMProvider('controller');

  const { duration } = usePlayerDuration();
  const { currentTime } = usePlayerCurrentTime();
  const { inited, playing, framesReady, over } = usePlayerStatus();

  const timeIndicator = `${_ms2Duration(currentTime)} / ${_ms2Duration(
    duration
  )}`;

  const percent = Math.ceil((currentTime * 100) / (duration || 1));

  const allowInteractive = inited && framesReady;

  return (
    <section {...style('$B lr-center')}>
      <div
        {...style('::progress')}
        style={{ '--percent': `${percent}%` } as any}
        onClick={handleJump}
      >
        <div {...style('::button')} />
      </div>
      <p {...style('::time')}>{timeIndicator}</p>
      <div {...style('::actions lr-center')}>
        {over ? (
          <Button
            icon="replay"
            disabled={!allowInteractive}
            onClick={_ => Player.replay()}
            large={true}
          />
        ) : playing ? (
          <Button
            icon="pause"
            disabled={!allowInteractive}
            onClick={_ => Player.pause()}
            large={true}
          />
        ) : (
          <Button
            icon="play_arrow"
            disabled={!allowInteractive}
            onClick={_ => Player.play()}
            large={true}
          />
        )}

        <Button
          icon="redo"
          disabled={playing || !allowInteractive}
          large={true}
        />
      </div>
    </section>
  );
}

function handleJump(evt) {
  const { pageX, target } = evt as MouseEvent;

  const percent = pageX / (target as HTMLDivElement).offsetWidth;

  Player.jump(percent);
}
