import { DOMMutationRecord } from "@waynecz/ui-recorder/dist/models/observers/mutation";
import DocumentBufferer from "./document";

let { getElementByRecordId, html2ElementorText } = DocumentBufferer;
getElementByRecordId = getElementByRecordId.bind(DocumentBufferer);

class PainterClass {
  private mouseLayer: HTMLCanvasElement;
  private clickLayer: HTMLElement;
  private domLayer: HTMLIFrameElement;

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

  public init(mouseLayer, clickLayer, domLayer) {
    this.mouseLayer = mouseLayer;
    this.clickLayer = clickLayer;
    this.domLayer = domLayer;
  }

  public paint(record): void {
    const { type } = record;

    const actionName = Object.keys(this.recordType2Action).includes(type)
      ? type
      : "default";

    // distribute action by different type
    this.recordType2Action[actionName](record);
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
            parentEle.insertBefore(eleToInsert, parentEle.childNodes[index])
          } else {
            // if index === undefined, html should be a textNode
            // Q: why not appendChild()
            // A: append() accept DOMString
            // more: https://mdn.io/append
            parentEle.append(html)
          }
        });
      }

      if (remove && remove.length) {
        remove.forEach(({ target, remaining }) => {
          // remove an element
          if (!remaining && target) {
            const eleToRemove = getElementByRecordId(target);
            eleToRemove && parentEle.removeChild(eleToRemove);
            return
          }

          // remove a textNode
          if (!target && remaining) {
            parentEle.innerHTML = remaining
          }
        });
      }
    }
  }

  private paintAttributeMutate(record: DOMMutationRecord): void {}

  private paintTextChange(record: DOMMutationRecord): void {}

  private paintFormChange(record): void {}
  private paintResize(record): void {}
  private paintScroll(record): void {}
}

const Painter = new PainterClass();

export default Painter;
