export interface Player {
  INTERVAL: number // interval between every frame
  playing: boolean // is it playing now
  over: boolean // is it playing now
  options?: PlayerOptions

  init(DTO: PlayerInitDTO): void

  play(): void
  pause(): void
  jump(time: number): void
  play(): void
}

export interface PlayerOptions {
  autoplay: boolean
}
export interface PlayerInitDTO {
  mouseLayer: HTMLElement
  canvas: HTMLElement
  domLayer: HTMLIFrameElement
  screen: HTMLDivElement
}
