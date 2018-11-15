import { ElementX } from "schemas/override";

/** 
 * Document buffer
 * 
 **/
class DocumentBufferer {
  private RecorderId2Element: Map<string, ElementX> = new Map();
  private Element2RecorderId: Map<ElementX, string | null> = new Map();

  public getElementByRecordId(id: string): ElementX | undefined {
    return this.RecorderId2Element.get(id);
  }

  public getRecordIdByElement(ele: ElementX): string | null | undefined {
    return this.Element2RecorderId.get(ele);
  }

  public buffer(ele: ElementX): void {
    if (ele.getAttribute) {
      const recorderId = ele.getAttribute("redorder-id");

      if (recorderId) {
        this.Element2RecorderId.set(ele, recorderId);
        this.RecorderId2Element.set(recorderId, ele);
      }
    }
  }

  public bufferNewElement(ele: ElementX): void {
    this.buffer(ele);

    const { children } = ele;

    if (children && children.length) {
      Array.from(children).forEach(this.bufferNewElement);
    }
  }

  public init(doc: Document): void {
    this.Element2RecorderId.clear()
    this.RecorderId2Element.clear()

    console.time('[Doc buffer]')
    Array.from(doc.all).forEach((ele: ElementX) => {
      this.buffer(ele);
    });
    console.timeEnd('[Doc buffer]')
  }
}

export default new DocumentBufferer();
