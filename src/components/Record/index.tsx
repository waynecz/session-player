import React from 'react';
import BEMProvider from 'tools/bem-classname';

export default function Record({ active }) {
  const style = BEMProvider('record');

  return (
    <li {...style({ active })}>
      <div {...style('::detail')}>
        <p {...style('::txt')} />
        <small {...style('::time')} />
      </div>
    </li>
  );
}
