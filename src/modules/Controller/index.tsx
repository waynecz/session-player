import React, { useState } from 'react';
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
  const { inited, playing, framesReady, over, jumping } = usePlayerStatus();

  const timeIndicator = `${_ms2Duration(currentTime)} / ${_ms2Duration(
    duration
  )}`;

  let [rulerPosition, setRulerPosition] = useState('0px');

  const percent = Math.ceil((currentTime * 100) / (duration || 1));

  const allowInteractive = inited && framesReady;

  return (
    <section {...style('$B lr-center')}>
      <div
        {...style('::progress', { jumping })}
        style={{ '--percent': `${percent}%` } as any}
        onClick={handleJump}
        // onMouseMove={evt => handleRulerMove(evt, setRulerPosition)}
      >
        <div {...style('::button')} />

        <div
          {...style('::ruler')}
          style={{ transform: `translateX(${rulerPosition})` }}
        />
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
            icon="play"
            disabled={!allowInteractive}
            onClick={_ => Player.play()}
            large={true}
          />
        )}

        <Button
          icon="next_step"
          disabled={playing || !allowInteractive || over}
          large={true}
        />
      </div>
    </section>
  );
}

async function handleJump(evt) {
  const { pageX, target } = evt as MouseEvent;

  const percent = pageX / (target as HTMLDivElement).offsetWidth;

  await Player.jump(percent);
}

function handleRulerMove(evt, setRulerPosition) {
  const { pageX } = evt as MouseEvent;

  setRulerPosition(`${pageX}px`);
}
