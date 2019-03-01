import hotkeys from 'hotkeys-js';
import Player from 'player';
import Store from 'stores';

const bindSpace = () => {
  hotkeys.unbind('space');
  hotkeys('space', evt => {
    evt.preventDefault();
    Player.playing ? Player.pause() : Player.play();
  });
};

const bindEsc = () => {
  hotkeys.unbind('esc');
  hotkeys('esc', evt => {
    evt.preventDefault();
    Store.fullScreen && Store.setFullScreen(false);
  });
};

const bindVisibilityChange = () => {
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden && Player.playing) {
        Player.pause();
      }
    },
    false
  );
};

function addHotKeys() {
  bindSpace();
  bindEsc();
  bindVisibilityChange();
}

export default addHotKeys;
