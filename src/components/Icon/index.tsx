import React from 'react';

interface props {
  name: string
}

const SEMANTIC_ICON_MAP = {
  'next_step': 'redo',
  'play': 'play_arrow',
}

export default function Icon({ name }: props) {
  return (
    <i className="icon material-icons">{SEMANTIC_ICON_MAP[name] || name}</i>
  );
}
