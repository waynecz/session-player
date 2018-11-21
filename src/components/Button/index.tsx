import React from 'react';
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

export default function Button({ icon, text, disabled = false, onClick, large: $large }: props) {
  if (!icon) _warn('Prop(icon) required!');

  const style = BEMProvider('button');

  return (
    <div {...style({ disabled, $large })} onClick={evt => onClick && onClick(evt)}>
      <Icon name={icon} />
      <span {...style('::text')}>{text}</span>
    </div>
  );
}
