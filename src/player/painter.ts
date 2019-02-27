import { RECORDER_ID } from 'session-recorder/dist/constants';

import {
  DOMMutationRecord,
  EventReocrd,
  MouseReocrd
} from 'session-recorder/dist/models/observers';
import { ElementX } from 'schemas/override';
import { _log, _warn, _error } from 'tools/log';
import { _now, _safeDivision, _throttle } from 'tools/utils';
import DocumentBufferer from './dom-bufferer';

let { getElementByRecordId, bufferNewElement } = DocumentBufferer;
getElementByRecordId = getElementByRecordId.bind(DocumentBufferer);
bufferNewElement = bufferNewElement.bind(DocumentBufferer);

declare var ResizeObserver;

class PainterClass {
  /**
   * ⚠️ Note:
   * screen includes canvas
   * canvas is composited with mouseLayer + clickLayer + domLayer
   */
  public screen: HTMLElement;
  public mouseLayer: HTMLElement;
  public mouse: HTMLElement;
  public click: HTMLElement;
  public domLayer: HTMLIFrameElement;
  public canvas: HTMLElement;

  public canvasWidth: number;
  public canvasHeight: number;
  public lastMousePos = { x: 0, y: 0 };

  public recordType2Action = {
    move: this.paintMouseMove,
    click: this.paintMouseClick,
    attr: this.paintAttributeMutate,
    node: this.paintNodeAddorRemove,
    text: this.paintTextChange,
    form: this.paintFormChange,
    resize: this.paintResize,
    scroll: this.paintScroll,
    // tslint:disable-next-line
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

  public init(domLayer, mouseLayer, canvas, screen) {
    this.domLayer = domLayer;
    this.mouseLayer = mouseLayer;
    this.mouse = document.getElementById('mouse')!;
    this.click = document.getElementById('click')!;
    this.canvas = canvas;
    this.screen = screen;

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
    // list tags below need specific wapper Tag, ensuring not to lost original dom structure
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
    const { x, y } = record;
    const position = `translate(${x}px, ${y}px)`
		this.mouse.style.transform = position
  }

  private paintMouseClick(record: MouseReocrd): void {
    const { x, y } = record
    const dot = document.createElement('div')
    dot.className = 'screen_click'
    dot.style.left = x + 'px'
    dot.style.top = y + 'px'
    this.mouseLayer.append(dot)

    setTimeout(() => {
      dot.classList.add('is-active')
    }, 10)
  }

  private paintNodeAddorRemove(record: DOMMutationRecord): void {
    const { add, remove, target, prev, next } = record;

    const parentEle = getElementByRecordId(target);

    if (parentEle) {
      if (add && add.length) {
        add.forEach(({ html, index, type }) => {
          if (!html) return;

          const eleToInsert = this.html2ElementorText(html);

          const eleRecordId =
            eleToInsert.getAttribute && eleToInsert.getAttribute(RECORDER_ID);

          // 2. element may already existed in parentEle
          if (parentEle.querySelector(`[${RECORDER_ID}="${eleRecordId}"]`)) {
            return;
          }

          if (index || index === 0) {
            // 1. css insert
            if (parentEle.nodeName === 'STYLE') {
              parentEle.innerHTML = html;
              return;
            }

            // 3. the textContent does not change but you may receive an text node change
            // which text is entirely equal as before
            if (type === 'text' && html === parentEle.textContent) {
              return;
            }
            // https://mdn.io/insertBefore
            parentEle.insertBefore(eleToInsert, parentEle.childNodes[index]);

            bufferNewElement(eleToInsert);
          } else {
            if (type === 'text') {
              // html should be a textNode's textContent
              // more: https://mdn.io/append
              parentEle.append(html);
            } else {
              parentEle.appendChild(eleToInsert);
            }
          }
        });
      }

      if (remove && remove.length) {
        remove.forEach(({ target, textContent, index, type }) => {
          // remove an element
          if (target && type === 'ele') {
            try {
              const eleToRemove = getElementByRecordId(target);

              eleToRemove && parentEle.removeChild(eleToRemove);
            } catch (err) {
              console.warn('Remove ele Error: ', record);
            }
            return;
          }

          // remove an textNode with specific index
          if (index && type === 'text') {
            try {
              const eleToRemove = parentEle.childNodes[index];

              eleToRemove && parentEle.removeChild(eleToRemove);
            } catch (err) {
              console.warn('Remove text Error: ', record);
            }

            return;
          }

          // remove a textNode
          // textContent equal to " "  in most case :)
          if (textContent && type === 'text') {
            let prevEle;
            let nextEle;

            if (prev) {
              prevEle = getElementByRecordId(prev);
            }

            if (next) {
              prevEle = getElementByRecordId(next);
            }

            const textNodeToRemove = Array.from(parentEle.childNodes).find(
              node => {
                const isText = node.nodeName === '#text';
                const isContentMatched = node.textContent === textContent;
                const isPrevMatched = prevEle
                  ? node.previousSibling === prevEle
                  : true;

                const isNextMatched = nextEle
                  ? node.nextSibling === nextEle
                  : true;

                return (
                  isText && isContentMatched && isPrevMatched && isNextMatched
                );
              }
            );

            textNodeToRemove && parentEle.removeChild(textNodeToRemove);
          }
        });
      }
    }
  }

  private paintAttributeMutate(record: DOMMutationRecord): void {
    const { attr, target } = record;
    const targetEle = getElementByRecordId(target);

    if (targetEle && attr) {
      // DO NOT TOUCH RECORDER-ID！
      if (attr.k === RECORDER_ID) {
        return;
      }
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

    if (target) {
      const targetEle = target && getElementByRecordId(target);
      if (targetEle) {
        targetEle.scrollTop = y!;
        targetEle.scrollLeft = x!;
      }
    } else {
      const targetDocument = this.domLayer.contentDocument;
      if (targetDocument) {
        targetDocument.documentElement!.scrollLeft = x!;
        targetDocument.documentElement!.scrollTop = y!;
      }
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
