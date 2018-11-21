import Player from 'player';
import React, { useEffect } from 'react';
import { IPlayerClass } from 'schemas/player';
import { _log, _warn } from 'tools/log';
import BEMProvider from 'tools/bem-classname';

export default function Screen() {
  let player: IPlayerClass;
  let canvas: HTMLElement;
  let mouseLayer: HTMLCanvasElement;
  let clickLayer: HTMLElement;
  let domLayer: HTMLIFrameElement;

  const style = BEMProvider('screen');

  const domSnapshot = JSON.parse(window.localStorage.getItem(
    'domSnapshot'
  ) as string);

  useEffect(() => {
    Player.loadRecords();
    Player.init({
      mouseLayer,
      clickLayer,
      domLayer,
      domSnapshot,
      canvas
    })
      .catch(_warn)
      .then(_ => {
        Player.play();
      });
  });

  return (
    <div {...style()}>
      <section ref={ele => (canvas = ele!)} {...style('::canvas')}>
        {/* play DOM mutation */}
        <iframe
          ref={ele => (domLayer = ele!)}
          {...style('fill')}
          id="domLayer"
          sandbox="allow-forms allow-same-origin"
          src="about:blank"
          frameBorder="0"
        />

        {/* play mouse movement */}
        <canvas
          ref={(ele: HTMLCanvasElement) => (mouseLayer = ele)}
          {...style('fill')}
          id="mouseLayer"
        />

        {/* play mouse click */}
        <div
          ref={ele => (clickLayer = ele!)}
          {...style('fill')}
          id="clickLayer"
        />
      </section>
      <div {...style('::session-info')} />
    </div>
  );
}
