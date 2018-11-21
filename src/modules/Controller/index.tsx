import React from 'react';
import BEMProvider from 'tools/bem-classname';
import Button from 'components/Button';

export default function Controller() {
  const style = BEMProvider('controller');

  return (
    <section {...style('$B lr-center')}>
      <div {...style('::progress')}>
        <div {...style('::indicator')} />
      </div>
      <div {...style('::actions lr-center')}>
        <Button icon="play_arrow" large />
        <Button icon="call_missed_outgoing" large />
      </div>
    </section>
  );
}
