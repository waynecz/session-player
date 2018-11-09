import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Player from './Player';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Player />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
