

class Painter {
  private mouseLayer: HTMLCanvasElement;
  private clickLayer: HTMLElement;
  private domLayer: HTMLIFrameElement;
  private currentRecord

  init(mouseLayer, clickLayer, domLayer) {
    this.mouseLayer = mouseLayer
    this.clickLayer = clickLayer
    this.domLayer = domLayer
  }

  private paint(record): void {
    this.currentRecord = record
    
    const recordType2Action = {
      move: this.paintMouseMove,
      click: this.paintMouseClick,
      attr: this.paintDOMMutation,
      node: this.paintDOMMutation,
      text: this.paintDOMMutation,
      form: this.paintFormChange,
      resize: this.paintResize,
      scroll: this.paintScroll,
      default: () => {}
    };

    const { type } = record;

    const actionName = Object.keys(recordType2Action).includes(type)
      ? type
      : "default";

    // distribute action by different type
    recordType2Action[actionName](record);
  }

  private paintMouseMove(): void {}
  private paintMouseClick(): void {}
  private paintDOMMutation(): void {}
  private paintFormChange(): void {}
  private paintResize(): void {}
  private paintScroll(): void {}
}

export default new Painter()