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

setConfig({ pureSFC: true } as any);

function Layout() {
  const [message, setMessage] = useState('');
  const [messageVisible, setVisible] = useState(false);

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
    <section className="player">
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
      <div className="player_gap" />
    </section>
  );
}

export default hot(module)(Layout);
