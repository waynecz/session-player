import { ElementX } from "schemas/override";

class DocumentBuffer {
  private RecorderId2Element: Map<string, ElementX> = new Map();
  private Element2RecorderId: Map<ElementX, string | null> = new Map();

  public getElementByRecordId(id: string): ElementX | undefined {
    return this.RecorderId2Element.get(id);
  }

  public getRecordIdByElement(ele: ElementX): string | null | undefined {
    return this.Element2RecorderId.get(ele);
  }

  public bufferNewElement(ele: ElementX): void {
    if ((ele as HTMLElement).getAttribute) {
      const recorderId = ele.getAttribute("redorder-id");

      if (recorderId) {
        this.Element2RecorderId.set(ele, recorderId);
        this.RecorderId2Element.set(recorderId, ele);
      }
    }

    const { children } = ele;

    if (children && children.length) {
      Array.from(children).forEach(this.bufferNewElement);
    }
  }
}

export default new DocumentBuffer();
