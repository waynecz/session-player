import { MyWindow } from "schemas/override";
import {
  Hooks,
  PlayerClass,
  PlayerInitDTO,
  PlayerOptions
} from "schemas/player";
import { isFunction } from "tools/is";
import { _error } from "tools/log";
import DocumentBuffer from "./document";

class Player implements PlayerClass {
  public interval = 60;
  public now = 0;
  public playing = false;
  public inited = false;
  public options = {
    autoplay: false
  };
  private queues: Map<Hooks, Function[]> = new Map();

  private mouseLayer: HTMLCanvasElement;
  private clickLayer: HTMLElement;
  private domLayer: HTMLIFrameElement;

  constructor(options?: PlayerOptions) {
    Object.assign(this.options, options);
  }

  public play(): void {
    this.nextFrame();
  }

  public pause() {}

  public jump(time: number) {}

  public $on(hook: Hooks, action: Function) {
    const { queues } = this;
    const existingQ = queues.get(hook) || [];

    queues.set(hook, [...existingQ, action]);
  }

  public $off(hook: Hooks, thisAction: Function) {
    const Q = this.queues.get(hook) || [];
    if (!Q.length) {
      return;
    }

    const index = Q.indexOf(thisAction);

    if (index !== -1) {
      Q.splice(index, 1);
      this.queues.set(hook, Q);
    }
  }

  public $emit(hook: Hooks) {
    const Q = this.queues.get(hook) || [];
    if (!Q.length) {
      return;
    }

    Q.forEach(action => {
      if (isFunction(action)) {
        action();
      }
    });
  }

  public async init({
    mouseLayer,
    clickLayer,
    domLayer,
    domSnapshot
  }: PlayerInitDTO) {
    this.mouseLayer = mouseLayer;
    this.clickLayer = clickLayer;
    this.domLayer = domLayer;

    const status = await this.loadDocument(domSnapshot);

    if (status) {
      this.inited = true;
    }
  }

  private playMouseMove(): void {}
  private playMouseClick(): void {}
  private playDOMMutation(): void {}

  private loadDocument(domSnapshot: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const playerDocument = this.domLayer.contentDocument;

      if (!playerDocument) {
        return false;
      }

      try {
        // requestIdleCallback require very new verisons of Chrome, Firefox
        // more: http://mdn.io/requestIdleCallback
        (window as MyWindow).requestIdleCallback(() => {
          playerDocument.write(`<!DOCTYPE html>${domSnapshot}`);

          const noscript = playerDocument.querySelector("noscript");

          if (noscript) {
            noscript.style.display = "none";
          }

          Array.from(playerDocument.all).forEach(ele => {
            DocumentBuffer.bufferNewElement(ele as HTMLElement);
          });

          resolve(true);
        });
      } catch (err) {
        _error(err);
        reject(err);
      }
    });
  }

  private nextFrame() {}

  private nextAction() {}
}

export default new Player();
