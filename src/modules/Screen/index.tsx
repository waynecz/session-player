// import domSnapshot from "domx";
import Player from "player";
import React, { useEffect, useState } from "react";

type Ref = HTMLIFrameElement | HTMLElement | null;

export default function Screen(this: any) {
  let screen: Ref;
  let domLayer: Ref;
  let mouseLayer: Ref;
  let clickLayer: Ref;

  useEffect(() => {
    Player.init();
  });

  return (
    <div ref={ele => (screen = ele)} className="screen">
      <canvas
        ref={ele => (mouseLayer = ele)}
        className="fill"
        id="mouseLayer"
      />
      <div ref={ele => (clickLayer = ele)} className="fill" id="clickLayer" />
      <iframe
        ref={ele => (domLayer = ele)}
        className="fill"
        id="domLayer"
        sandbox="allow-forms allow-same-origin"
        src="about:blank"
        frameBorder="0"
      />
    </div>
  );
}
