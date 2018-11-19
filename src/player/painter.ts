import { EventReocrd } from "@waynecz/ui-recorder/dist/models/observers/event";
import { DOMMutationRecord } from "@waynecz/ui-recorder/dist/models/observers/mutation";
import { ElementX } from "schemas/override";
import { _log, _warn } from "tools/log";
import { _now, _safeDivision, _throttle } from "tools/utils";
import DocumentBufferer from "./document";

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
    tr: "tbody",
    td: "tr",
    th: "tr",
    col: "colgroup",
    colgroup: "table",
    thead: "table",
    tbody: "table"
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
    const { type } = record;

    const actionName = Object.keys(this.recordType2Action).includes(type)
      ? type
      : "default";

    // distribute action by different type
    this.recordType2Action[actionName].call(this, record);
  }

  private html2ElementorText(html: string): ElementX {
    // list tags below need specific wapper Tag, ensuring not lost original dom structure
    const matchRst = /^<(tr|td|th|col|colgroup|thead|tbody)[\s\S]*>[\w\W]*?<\/(tr|td|th|col|colgroup|thead|tbody)>$/g.exec(
      html
    );
    let wrapperTagName = "div";

    if (matchRst && matchRst[1]) {
      wrapperTagName = this.wrapperTagMap[matchRst[1]];
    }

    const div = document.createElement(wrapperTagName);
    div.innerHTML = html;
    return div.firstChild as ElementX;
  }

  private paintMouseMove(record): void {}
  private paintMouseClick(record): void {}

  private paintNodeAddorRemove(record: DOMMutationRecord): void {
    const { add, remove, target } = record;
    if (target === 164) {
      debugger;
    }
    const parentEle = getElementByRecordId(target);

    if (parentEle) {
      if (add && add.length) {
        add.forEach(({ html, index }) => {
          if (index || index === 0) {
            const eleToInsert = this.html2ElementorText(html);
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
        remove.forEach(({ target, remaining, index }) => {
          // remove an element
          if (target) {
            const eleToRemove = getElementByRecordId(target);

            eleToRemove && parentEle.removeChild(eleToRemove);
            return;
          }

          if (index) {
            parentEle.removeChild(parentEle.childNodes[index]);
          }

          // remove a textNode in a contenteditable element
          if (remaining) {
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
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
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
    this.canvas.style.opacity = "0";

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
        this.canvas.style.opacity = "1";
      });
    }
  }
}

const Painter = new PainterClass();

export default Painter;
