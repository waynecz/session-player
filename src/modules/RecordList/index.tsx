import React from 'react';
import BEMProvider from 'tools/bem-classname';
import Record from 'components/Record';

export default function RecordList() {
  const className = BEMProvider('list');

  return (
    <div {...className()}>
      <ul {...className('::container')}>
        {Array(20)
          .fill(1)
          .map((_, i) => (
            <Record key={i} active={i === 7} />
          ))}
      </ul>
      <div {...className('::mask')} />
    </div>
  );
}
