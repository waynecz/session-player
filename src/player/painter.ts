import { ID_KEY } from '@waynecz/ui-recorder/dist/constants';

import { DOMMutationRecord } from '@waynecz/ui-recorder/dist/models/observers/mutation';
import { ElementX } from 'schemas/override';
import { _log, _warn, _error } from 'tools/log';
import { _now, _safeDivision, _throttle } from 'tools/utils';
import DocumentBufferer from './document';

import {
  EventReocrd,
  MouseReocrd
} from '@waynecz/ui-recorder/dist/models/observers/event';

let { getElementByRecordId, bufferNewElement } = DocumentBufferer;
getElementByRecordId = getElementByRecordId.bind(DocumentBufferer);
bufferNewElement = bufferNewElement.bind(DocumentBufferer);

declare var ResizeObserver;

class PainterClass {
  /**
   * Note:
   * screen includes canvas
   * canvas is composited with mouseLayer + clickLayer + domLayer
   */
  private screen: HTMLElement;
  private mouseLayer: HTMLCanvasElement;
  private clickLayer: HTMLElement;
  private domLayer: HTMLIFrameElement;
  private canvas: HTMLElement;

  private canvasWidth: number;
  private canvasHeight: number;
  private lastMousePos = { x: 0, y: 0 };

  private recordType2Action = {
    move: this.paintMouseMove,
    click: this.paintMouseClick,
    attr: this.paintAttributeMutate,
    node: this.paintNodeAddorRemove,
    text: this.paintTextChange,
    form: this.paintFormChange,
    resize: this.paintResize,
    scroll: this.paintScroll,
    default: () => {}
  };

  private wrapperTagMap: object = {
    tr: 'tbody',
    td: 'tr',
    th: 'tr',
    col: 'colgroup',
    colgroup: 'table',
    thead: 'table',
    tbody: 'table'
  };

  public init(mouseLayer, clickLayer, domLayer, canvas) {
    this.mouseLayer = mouseLayer;
    this.clickLayer = clickLayer;
    this.domLayer = domLayer;
    this.canvas = canvas;
    this.screen = canvas.parentElement;

    const repositionCanvas = _throttle(this.repositionCanvas, 200).bind(this);
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(({ target }) => {
        if (target === this.screen) {
          repositionCanvas.call(this);
        }
      });
    });

    resizeObserver.observe(this.screen);
  }

  public paint(record): void {
    try {
      const { type } = record;

      const actionName = Object.keys(this.recordType2Action).includes(type)
        ? type
        : 'default';

      // distribute action by different type
      this.recordType2Action[actionName].call(this, record);

      record.played = true;
    } catch (err) {
      _error(record);
      _error(err);
    }
  }

  private html2ElementorText(html: string): ElementX {
    // list tags below need specific wapper Tag, ensuring not lost original dom structure
    const matchRst = /^<(tr|td|th|col|colgroup|thead|tbody)[\s\S]*>[\w\W]*?<\/(tr|td|th|col|colgroup|thead|tbody)>$/g.exec(
      html
    );
    let wrapperTagName = 'div';

    if (matchRst && matchRst[1]) {
      wrapperTagName = this.wrapperTagMap[matchRst[1]];
    }

    const div = document.createElement(wrapperTagName);
    div.innerHTML = html;
    return div.firstChild as ElementX;
  }

  private paintMouseMove(record: MouseReocrd): void {
    const mouseCtx = this.mouseLayer.getContext('2d');
    const { x: lastX, y: lastY } = this.lastMousePos;
    const { x, y } = record;

    if (mouseCtx && x && y) {
      mouseCtx.strokeStyle = 'rgba(239, 35, 35, 0.6)';
      mouseCtx.lineWidth = 2;
      mouseCtx.beginPath();
      mouseCtx.moveTo(lastX || x - 1, lastY || y - 1);
      mouseCtx.lineTo(x, y);
      mouseCtx.closePath();
      mouseCtx.stroke();
      this.lastMousePos = { x, y };
    }
  }

  public clearMouseMove(): void {
    const mouseCtx = this.mouseLayer.getContext('2d');
    if (mouseCtx) {
      mouseCtx.clearRect(0, 0, this.mouseLayer.width, this.mouseLayer.height);
    }
  }

  private paintMouseClick(record: MouseReocrd): void {
    const { x, y } = record;
    const dot = document.createElement('div');
    dot.className = 'screen_click-dot';
    dot.style.top = y + 'px';
    dot.style.left = x + 'px';
    this.clickLayer.append(dot);
    // after dot dom appended
    setTimeout(() => {
      dot.classList.add('fading');
    }, 10);
  }

  public clearMouseClick(): void {
    this.clickLayer.innerHTML = '';
  }

  private paintNodeAddorRemove(record: DOMMutationRecord): void {
    const { add, remove, target } = record;
    if (target === 164) {
      debugger;
    }
    const parentEle = getElementByRecordId(target);

    if (parentEle) {
      if (add && add.length) {
        add.forEach(({ html, index }) => {
          if (!html) return;

          if (index || index === 0) {
            const eleToInsert = this.html2ElementorText(html);
            const thisRecordId =
              eleToInsert.getAttribute && eleToInsert.getAttribute(ID_KEY);
            // element may already existed in parentEle
            if (parentEle.querySelector(`[${ID_KEY}="${thisRecordId}"]`)) {
              return;
            }
            // https://mdn.io/insertBefore
            parentEle.insertBefore(eleToInsert, parentEle.childNodes[index]);

            bufferNewElement(eleToInsert);
          } else {
            // if index === undefined, html should be a textNode
            // Q: why not appendChild()
            // A: append() can accept a DOMString
            // more: https://mdn.io/append
            parentEle.append(html);
          }
        });
      }

      if (remove && remove.length) {
        remove.forEach(({ target, remaining, index, type }) => {
          // remove an element
          if (target && type === 'ele') {
            const eleToRemove = getElementByRecordId(target);

            eleToRemove && parentEle.removeChild(eleToRemove);
            return;
          }

          // remove an textNode with specific index
          if (index && type === 'text') {
            parentEle.removeChild(parentEle.childNodes[index]);
          }

          // remove a textNode in a contenteditable element
          if (remaining && type === 'text') {
            parentEle.innerHTML = remaining;
          }
        });
      }
    }
  }

  private paintAttributeMutate(record: DOMMutationRecord): void {
    const { attr, target } = record;
    const targetEle = getElementByRecordId(target);

    if (targetEle && attr) {
      targetEle.setAttribute(attr.k, attr.v);
    }
  }

  private paintTextChange(record: DOMMutationRecord): void {
    const { text, html, target } = record;
    const targetEle = getElementByRecordId(target);

    if (targetEle) {
      if (html) {
        targetEle.innerHTML = html;
        return;
      }

      targetEle.textContent = text as string | null;
    }
  }

  private paintFormChange(record: EventReocrd): void {
    const { k, v, target } = record;
    const targetEle = target && getElementByRecordId(target);

    if (targetEle) {
      targetEle[k!] = v;
    }
  }

  private paintResize(record): void {
    const { w, h } = record;
    this.canvasWidth = w;
    this.canvasHeight = h;

    this.repositionCanvas();

    setImmediate(() => {
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
    });
  }

  private paintScroll(record: EventReocrd): void {
    const { x, y, target } = record;
    const targetEle = target && getElementByRecordId(target);
    if (targetEle) {
      targetEle.scrollTop = y!;
      targetEle.scrollLeft = x!;
    }
  }

  // make Canvas always stay in the center of screen
  private repositionCanvas(): void {
    this.canvas.style.opacity = '0';

    const { canvasWidth, canvasHeight } = this;

    if (this.screen) {
      setImmediate(() => {
        const {
          offsetHeight: screenHeight,
          offsetWidth: screenWidth
        } = this.screen;

        this.mouseLayer.width = canvasWidth;
        this.mouseLayer.height = canvasHeight;

        const widthScale = _safeDivision(screenWidth, canvasWidth);
        const heightScale = _safeDivision(screenHeight, canvasHeight);

        const finalScale: number = Math.min(widthScale, heightScale);

        this.canvas.style.transform = `scale(${finalScale}) translate(-50%, -50%)`;
        this.canvas.style.opacity = '1';
      });
    }
  }
}

const Painter = new PainterClass();

export default Painter;
