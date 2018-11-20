import React from 'react';

interface props {
  name: string
}

export default function Icon({ name }: props) {
  return (
    <i className="icon material-icons">{name}</i>
  );
}
