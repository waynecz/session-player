import React from 'react';

import Controller from './modules/Controller';
import RecorderList from './modules/RecordList';
import Screen from './modules/Screen';
import Toolbar from './modules/Toolbar';

import { hot, setConfig } from 'react-hot-loader';

setConfig({ pureSFC: true } as any);

function Layout() {
  return (
    <section className="player">
      <RecorderList />
      <Toolbar />
      <Screen />
      <Controller />
      <div className="player_gap" />
    </section>
  );
}

export default hot(module)(Layout);
