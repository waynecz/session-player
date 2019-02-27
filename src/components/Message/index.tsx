import React from 'react';
import BEMProvider from 'tools/bem-classname';
import Icon from '../Icon';
import Snackbar, { SnackbarProps } from '@material-ui/core/Snackbar';

type props = {
  content: any;
  handleClose?: Function;
} & SnackbarProps;

const bem = BEMProvider('message');

export default function Message({
  content,
  handleClose,
  ...snackbarProps
}: props) {
  const contentElement = (
    <div {...bem('::content')}>
      <Icon name="error" />
      <span {...bem('::text')}>{content}</span>
    </div>
  );

  return (
    <Snackbar
      {...bem()}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      onClose={() => {
        handleClose && handleClose();
      }}
      autoHideDuration={100000}
      message={contentElement}
      {...snackbarProps}
    />
  );
}
