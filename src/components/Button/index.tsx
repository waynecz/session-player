import React from 'react';
import Icon from '../Icon';
import { _warn } from 'tools/log';
import getBEMProvider from 'tools/bem-classname';

interface props {
  icon: string;
  text?: string;
  disabled?: boolean;
  onClick?: (evt: React.MouseEvent) => any;
}

export default function Button({ icon, text, disabled = false, onClick }: props) {
  if (!icon) _warn('Prop(icon) required!');

  const buttonClass = getBEMProvider('button');

  return (
    <div {...buttonClass({ disabled })} onClick={evt => onClick && onClick(evt)}>
      <Icon name={icon} />
      <span {...buttonClass('text')}>{text}</span>
    </div>
  );
}
