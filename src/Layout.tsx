import React, { useEffect, useState } from 'react';

import Controller from './modules/Controller';
import Actions from './modules/Actions';
import Screen from './modules/Screen';
import Toolbar from './modules/Toolbar';
import Message from './components/Message';

import { hot, setConfig } from 'react-hot-loader';
import { getRecorderData } from 'services/localStorage';
import Player from 'player';
import addHotKeys from 'player/hotkeys';
import { useStoreState } from 'stores';
import BEMProvider from 'tools/bem-classname';

setConfig({ pureSFC: true } as any);

const bem = BEMProvider('player');

function Layout() {
  const [message, setMessage] = useState('');
  const [messageVisible, setVisible] = useState(false);

  const fullScreen = useStoreState('fullScreen');

  useEffect(
    () => {
      addHotKeys();
      getRecorderData()
        .then(data => {
          Player.loadRecorderData(data as any);
        })
        .catch(err => {
          setMessage(err);
          setVisible(true);
        });
    },
    [null]
  );

  return (
    <section {...bem({ full: fullScreen })}>
      <Message
        handleClose={() => {
          setVisible(false);
        }}
        open={messageVisible}
        content={message}
      />
      <Actions />
      <Toolbar />
      <Screen />
      <Controller />
      <div {...bem('::gap')} />
    </section>
  );
}

export default hot(module)(Layout);
