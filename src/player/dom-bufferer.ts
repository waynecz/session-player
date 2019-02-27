import { ElementX, myWindow } from 'schemas/override'
import { _error, _warn } from 'tools/log'
import { RECORDER_ID } from 'session-recorder/dist/constants'

// TODO: merge into painter
class DomTreeBuffererClass {
  public pageSnapshot: string
  public domLayer: HTMLIFrameElement
  public referer: string

  private RecorderId2Element: Map<number, ElementX> = new Map()
  private Element2RecorderId: Map<ElementX, number | null> = new Map()

  public getElementByRecordId(id: number): ElementX | undefined {
    return this.RecorderId2Element.get(id)
  }

  public getRecordIdByElement(ele: ElementX): number | null | undefined {
    return this.Element2RecorderId.get(ele)
  }

  private buffer(ele: ElementX): void {
    if (ele.getAttribute) {
      let recorderId = ele.getAttribute(RECORDER_ID)

      if (recorderId) {
        const id: number = parseInt(recorderId, 10)

        this.Element2RecorderId.set(ele, id)
        this.RecorderId2Element.set(id, ele)
      }
    }
  }

  public bufferNewElement = (ele: ElementX): void => {
    this.buffer(ele)

    const { children } = ele

    if (children && children.length) {
      Array.from(children).forEach(this.bufferNewElement)
    }
  }

  private wash(snapshot: string): string {
    const escapeScriptTagReg = /<(script|noscript)[^>]*>[\s\S]*?<\/[^>]*(script|noscript)>/g
    // link tag which preload/fetch a script
    const escapeLinkTagReg = /<link([^>]*js[^>]*)>/g

    return snapshot.replace(escapeLinkTagReg, '').replace(escapeScriptTagReg, '')
  }

  private insertBaseTag(snapshot: string): string {
    const baseTag = `<base href="${this.referer}">`
    const headTagReg = /<head[^>]*>/g

    return snapshot.replace(headTagReg, `$& ${baseTag}`)
  }

  public reload() {
    this.domLayer.src = 'about:blank'

    return new Promise(resolve => {
      this.domLayer.onload = async () => {
        await this.fillTheDomLayerBySnapshot(this.domLayer, this.pageSnapshot, this.referer)
        resolve()
      }
    })
  }

  public fillTheDomLayerBySnapshot(domLayer: HTMLIFrameElement, pageSnapshot: string, referer: string): Promise<boolean> {
    this.Element2RecorderId.clear()
    this.RecorderId2Element.clear()
    this.domLayer = domLayer
    this.referer = referer
    this.pageSnapshot = this.wash(pageSnapshot)
    this.pageSnapshot = this.insertBaseTag(pageSnapshot)

    return new Promise((resolve, reject) => {
      const layerDoc = domLayer.contentDocument

      if (!layerDoc) {
        reject(false)
        _warn("iframe document doesn't existed!")
        return
      }

      try {
        // requestIdleCallback require very new verisons of Chrome, Firefox
        // more: http://mdn.io/requestIdleCallback
        myWindow.requestIdleCallback(() => {
          layerDoc.write(`<!DOCTYPE html>${this.pageSnapshot}`)

          // insert default css
          const playerDefaultStyle = layerDoc.createElement('style')
          playerDefaultStyle.setAttribute('type', 'text/css')
          playerDefaultStyle.innerHTML = `html {background: #fff;} noscript {display: none;}`
          layerDoc.head!.insertBefore(playerDefaultStyle, layerDoc.head!.firstChild!)

          console.time('[Dom buffer]')
          Array.from(layerDoc.querySelectorAll('*')).forEach((ele: ElementX) => {
            this.buffer(ele)
          })
          console.timeEnd('[Dom buffer]')

          myWindow.__DOC_BUF__ = this

          resolve(true)
        })
      } catch (err) {
        // TODO: render failed message into Screen
        reject(false)
      }
    })
  }
}

const DomTreeBufferer = new DomTreeBuffererClass()

export default DomTreeBufferer
