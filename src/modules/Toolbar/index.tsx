import React, { useState } from 'react';
import Button from 'components/Button';
import BEMProvider from 'tools/bem-classname';

export default function Toolbar() {
  const style = BEMProvider('toolbar');

  return (
    <div {...style()}>
      <h1 {...style('::heading')}>Screen</h1>
      <div {...style('::actions lr-center')}>
        <Button icon="person" />
        <Button icon="settings" />
      </div>
    </div>
  );
}
