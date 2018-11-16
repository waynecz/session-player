import { EventReocrd } from "@waynecz/ui-recorder/dist/models/observers/event";
import { DOMMutationRecord } from "@waynecz/ui-recorder/dist/models/observers/mutation";
import DocumentBufferer from "./document";
import { _throttle, _now } from 'tools/utils';

let {
  getElementByRecordId,
  html2ElementorText,
  bufferNewElement
} = DocumentBufferer;
getElementByRecordId = getElementByRecordId.bind(DocumentBufferer);
bufferNewElement = bufferNewElement.bind(DocumentBufferer);

declare var ResizeObserver;

class PainterClass {
  private mouseLayer: HTMLCanvasElement;
  private clickLayer: HTMLElement;
  private screen: HTMLElement;
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

  public init(mouseLayer, clickLayer, domLayer, canvas) {
    this.mouseLayer = mouseLayer;
    this.clickLayer = clickLayer;
    this.domLayer = domLayer;
    this.canvas = canvas;
    this.screen = canvas.parentElement;

    const canvasResize = _throttle(this.canvasResize, 200).bind(this)
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(({ target }) => {
        if (target === this.screen) {
          canvasResize.call(this)
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

  private paintMouseMove(record): void {}
  private paintMouseClick(record): void {}

  private paintNodeAddorRemove(record: DOMMutationRecord): void {
    const { add, remove, target } = record;
    const parentEle = getElementByRecordId(target);

    if (parentEle) {
      if (add && add.length) {
        add.forEach(({ html, index }) => {
          if (index || index === 0) {
            const eleToInsert = html2ElementorText(html);
            // https://mdn.io/insertBefore
            parentEle.insertBefore(eleToInsert, parentEle.childNodes[index]);

            bufferNewElement(eleToInsert);
          } else {
            // if index === undefined, html should be a textNode
            // Q: why not appendChild()
            // A: append() accept DOMString
            // more: https://mdn.io/append
            parentEle.append(html);
          }
        });
      }

      if (remove && remove.length) {
        remove.forEach(({ target, remaining }) => {
          // remove an element
          if (!remaining && target) {
            const eleToRemove = getElementByRecordId(target);
            eleToRemove && parentEle.removeChild(eleToRemove);
            return;
          }

          // remove a textNode
          if (!target && remaining) {
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

    this.canvasResize();

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

  private canvasResize(): void {
    this.canvas.style.opacity = "0";

    const { canvasWidth, canvasHeight } = this;

    if (screen) {
      setImmediate(() => {
        const {
          offsetHeight: screenHeight,
          offsetWidth: screenWidth
        } = this.screen;

        const widthScale = screenWidth / canvasWidth;
        const heightScale = screenHeight / canvasHeight;

        const finalScale = Math.min(widthScale, heightScale);

        this.canvas.style.transform = `scale(${finalScale}) translate(-50%, -50%)`;
        this.canvas.style.opacity = "1";
      });
    }
  }
}

const Painter = new PainterClass();

export default Painter;
