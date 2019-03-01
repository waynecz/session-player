import React from 'react';
import { _warn } from 'tools/log';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import Icon from '../Icon';
import BEMProvider from 'tools/bem-classname';

type props = {
  icon: string;
  text?: string;
  disabled?: boolean;
  dark?: boolean;
  small?: boolean;
  onClick?: (evt: React.MouseEvent) => any;
} & IconButtonProps;

const bem = BEMProvider('button');

export default function Button({
  icon,
  text,
  small,
  dark,
  disabled = false,
  onClick,
  ...iconButtonProps
}: props) {
  if (!icon) _warn('Prop icon required!');

  function clickHandler(evt: React.MouseEvent<HTMLElement>): any {
    if (disabled) return;

    onClick && onClick(evt);
  }

  return (
    <div {...bem({ disabled, dark })}>
      <IconButton color="inherit" onClick={clickHandler} {...iconButtonProps}>
        <Icon name={icon} large={!small} />
      </IconButton>
    </div>
  );
}
