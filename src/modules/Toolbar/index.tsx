import React, { useState } from 'react';
import Button from 'components/Button';
import getBEMProvider from 'tools/bem-classname';

export default function Toolbar() {
  const toolbarClass = getBEMProvider('toolbar');

  let [active, setActive] = useState(true);

  function onClick() {
    setActive(!active);
  }

  return (
    <div {...toolbarClass({ active })}>
      <h1 {...toolbarClass('heading', { active })}>Screen</h1>
      <div {...toolbarClass('actions')}>
        <Button icon="person" disabled={active}/>
        <Button icon="settings" onClick={onClick}  />
      </div>
    </div>
  );
}
