import React from 'react';
import BEMProvider from 'tools/bem-classname';
import Button from 'components/Button';
import { usePlayDuration, usePlayingTimeChange } from 'player/hooks';

export default function Controller() {
  const style = BEMProvider('controller');

  const { duration } = usePlayDuration()
  const { playedDuration } = usePlayingTimeChange()

  const timeIndicator = `${playedDuration} / ${duration}`

  return (
    <section {...style('$B lr-center')}>
      <div {...style('::progress')}>
        <div {...style('::indicator')} data-time={timeIndicator} />
      </div>
      <div {...style('::actions lr-center')}>
        <Button icon="play_arrow" large={true} />
        <Button icon="redo" large={true} />
      </div>
    </section>
  );
}
