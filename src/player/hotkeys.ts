import hotkeys from 'hotkeys-js';
import Player from 'player';

const bindSpace = () => {
  hotkeys.unbind('space');
  hotkeys('space', evt => {
    evt.preventDefault();
    Player.playing ? Player.pause() : Player.play();
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
  bindVisibilityChange();
}

export default addHotKeys;
