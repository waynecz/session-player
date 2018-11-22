import React, { useEffect } from 'react';
import Icon from '../Icon';
import { _warn } from 'tools/log';
import BEMProvider from 'tools/bem-classname';

interface props {
  icon: string;
  text?: string;
  disabled?: boolean;
  large?: boolean;
  onClick?: (evt: React.MouseEvent) => any;
}

export default function Button({
  icon,
  text,
  disabled = false,
  onClick,
  large: $large
}: props) {
  if (!icon) _warn('Prop(icon) required!');

  const style = BEMProvider('button');

  function clickhandler(evt: React.MouseEvent<HTMLElement>): any {
    if (disabled) return;

    onClick && onClick(evt);
  }

  return (
    <div {...style({ disabled, $large })} onClick={clickhandler}>
      <Icon name={icon} />
      <span {...style('::text')}>{text}</span>
    </div>
  );
}
