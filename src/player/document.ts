import { ElementX, MyWindow } from 'schemas/override';
import { _error, _warn } from 'tools/log';
import { ID_KEY } from '@waynecz/ui-recorder/dist/constants';

const myWindow: MyWindow = window as any;

/**
 * Document buffer
 **/
class DocumentBuffererClass {
  public domSnapshot: string;
  public domLayer: HTMLIFrameElement;

  private RecorderId2Element: Map<number, ElementX> = new Map();
  private Element2RecorderId: Map<ElementX, number | null> = new Map();

  public getElementByRecordId(id: number): ElementX | undefined {
    return this.RecorderId2Element.get(id);
  }

  public getRecordIdByElement(ele: ElementX): number | null | undefined {
    return this.Element2RecorderId.get(ele);
  }

  private buffer(ele: ElementX): void {
    if (ele.getAttribute) {
      let recorderId = ele.getAttribute(ID_KEY);

      if (recorderId) {
        const id: number = parseInt(recorderId);

        this.Element2RecorderId.set(ele, id);
        this.RecorderId2Element.set(id, ele);
      }
    }
  }

  public bufferNewElement = (ele: ElementX): void => {
    this.buffer(ele);

    const { children } = ele;

    if (children && children.length) {
      Array.from(children).forEach(this.bufferNewElement);
    }
  };

  public init(
    domLayer: HTMLIFrameElement,
    domSnapshot: string
  ): Promise<boolean> {
    this.Element2RecorderId.clear();
    this.RecorderId2Element.clear();
    this.domLayer = domLayer;
    this.domSnapshot = domSnapshot;

    return new Promise((resolve, reject) => {
      const layerDoc = domLayer.contentDocument;

      if (!layerDoc) {
        reject(false);
        _warn("iframe document doesn't existed!");
        return;
      }

      try {
        // requestIdleCallback require very new verisons of Chrome, Firefox
        // more: http://mdn.io/requestIdleCallback
        myWindow.requestIdleCallback(() => {
          layerDoc.write(`<!DOCTYPE html>${domSnapshot}`);

          const noscript = layerDoc.querySelector('noscript');

          if (noscript) {
            noscript.style.display = 'none';
          }

          console.time('[Doc buffer]');
          Array.from(layerDoc.all).forEach((ele: ElementX) => {
            this.buffer(ele);
          });
          console.timeEnd('[Doc buffer]');

          myWindow.__DOC_BUF__ = this;

          resolve(true);
        });
      } catch (err) {
        // TODO: render failed message into Screen
        reject(false);
      }
    });
  }
}

const DocumentBufferer = new DocumentBuffererClass();

export default DocumentBufferer;
