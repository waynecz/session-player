import React, { useState } from 'react';
import Button from 'components/Button';
import BEMProvider from 'tools/bem-classname';

export default function Toolbar() {
  const style = BEMProvider('toolbar');

  let [active, setActive] = useState(true);

  function onClick() {
    setActive(!active);
  }

  return (
    <div {...style({ $name: active })}>
      <h1 {...style('::heading', { $active: active, $name: active, do: active })}>Screen</h1>
      <div {...style('::actions lr-center')}>
        <Button icon="person" disabled={active}/>
        <Button icon="settings" onClick={onClick}  />
      </div>
    </div>
  );
}
