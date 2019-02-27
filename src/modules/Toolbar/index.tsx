import React from 'react';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import BEMProvider from 'tools/bem-classname';

const bem = BEMProvider('toolbar');

export default function Toolbar() {
  return (
    <div {...bem()}>
      <h1 {...bem('::heading')}>Screen</h1>
      <div {...bem('::actions lr-center')}>
        <Tooltip title="快捷键，目前只有「空格键」能控制播放/暂停">
          <Button small={true} icon="keyboard" />
        </Tooltip>
        <Tooltip title="用户信息">
          <Button small={true} disabled={true} icon="person" />
        </Tooltip>
        <Tooltip title="播放器设置">
          <Button small={true} disabled={true} icon="settings" />
        </Tooltip>
      </div>
    </div>
  );
}
