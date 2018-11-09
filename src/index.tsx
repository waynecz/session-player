import React from 'react';
import ReactDOM from 'react-dom';
import Player from './Player';
import * as serviceWorker from './service-worker';

ReactDOM.render(<Player />, document.getElementById('root'));

// to use service worker, change to .register()
serviceWorker.register();
