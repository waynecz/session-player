import Player from 'player';
import React, { useEffect } from 'react';
import { PlayerClass } from 'schemas/player';
import { _log, _warn } from 'tools/log';

function Screen() {
  let player: PlayerClass;
  let canvas: HTMLElement;
  let mouseLayer: HTMLCanvasElement;
  let clickLayer: HTMLElement;
  let domLayer: HTMLIFrameElement;

  const domSnapshot = JSON.parse(window.localStorage.getItem(
    'domSnapshot'
  ) as string);

  useEffect(() => {
    Player.loadRecords();
    Player.init({ mouseLayer, clickLayer, domLayer, domSnapshot, canvas })
      .then(playerInstance => {
        player = playerInstance;
        player.play();
      })
      .catch(err => {
        _warn(err);
      });
  });

  return (
    <div className="screen">
      <section ref={ele => (canvas = ele!)} className="screen_canvas">
        {/* DOM mutations */}
        <iframe
          ref={ele => (domLayer = ele!)}
          className="fill"
          id="domLayer"
          sandbox="allow-forms allow-same-origin"
          src="about:blank"
          frameBorder="0"
        />

        {/* Mouse trail */}
        <canvas
          ref={(ele: HTMLCanvasElement) => (mouseLayer = ele)}
          className="fill"
          id="mouseLayer"
        />

        {/* Mouse click indicators */}
        <div
          ref={ele => (clickLayer = ele!)}
          className="fill"
          id="clickLayer"
        />
      </section>
    </div>
  );
}

export default Screen;
