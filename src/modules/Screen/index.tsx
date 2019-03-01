import Player from 'player';
import React, { useEffect } from 'react';
import { _log, _warn } from 'tools/log';
import BEMProvider from 'tools/bem-classname';
import Icon from 'components/Icon';
import { useStore } from 'stores';
import { usePlayerStatus } from 'player/hooks';

const bem = BEMProvider('screen');

export default function Screen() {
  let screen: HTMLDivElement;
  let canvas: HTMLElement;
  let mouseLayer: HTMLElement;
  let domLayer: HTMLIFrameElement;

  const { jumping } = usePlayerStatus();

  const fullScreen = useStore<boolean>('fullScreen');

  useEffect(
    () => {
      Player.init({
        mouseLayer,
        domLayer,
        canvas,
        screen
      }).catch(_warn);
    },
    [null]
  );

  const loaded = useStore<boolean>('loaded');
  const error = useStore<boolean>('error');

  return (
    <div
      {...bem({ blur: jumping, full: fullScreen })}
      ref={ele => (screen = ele!)}
    >
      <div {...bem('::spinner', { hidden: loaded || error })} />

      <div {...bem('::error', { visible: error })}>
        <Icon name="error" />
      </div>

      <section ref={ele => (canvas = ele!)} {...bem('::canvas')}>
        {/* replay DOM mutation */}
        <iframe
          ref={ele => (domLayer = ele!)}
          {...bem('fill')}
          id="domLayer"
          sandbox="allow-forms allow-same-origin"
          src="about:blank"
          frameBorder="0"
        />

        {/* replay mouse move & click */}
        <div {...bem('fill')} id="mouseLayer" ref={ele => (mouseLayer = ele!)}>
          <div id="mouse" {...bem('::mouse', { visible: loaded && !error })} />
        </div>
      </section>

      <div {...bem('::session-info')} />
    </div>
  );
}
