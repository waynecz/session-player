import domSnapshot from 'domx';
import Player from 'player';
import React, { useEffect } from 'react';
import { _log } from 'tools/log';

type Ref = HTMLIFrameElement | HTMLElement | null;

function Screen() {
  let screen: Ref;
  let mouseLayer: HTMLCanvasElement;
  let clickLayer: HTMLElement;
  let domLayer: HTMLIFrameElement;

  useEffect(() => {
    Player.init({ mouseLayer, clickLayer, domLayer, domSnapshot });
  });

  return (
    <div ref={ele => (screen = ele)} className="screen">
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
      <div ref={ele => (clickLayer = ele!)} className="fill" id="clickLayer" />
    </div>
  );
}

export default Screen;
