export interface IPlayerClass {
  interval: number; // interval between every frame
  playing: boolean; // is it playing now
  records?: any[];
  options?: PlayerOptions;

  init(DTO: PlayerInitDTO): void;

  play(): void;
  pause(): void;
  jump(time: number): void;
  play(): void;
}

export interface PlayerOptions {
  autoplay: boolean;
}
export interface PlayerInitDTO {
  records?: any
  mouseLayer: HTMLCanvasElement;
  canvas: HTMLElement;
  clickLayer: HTMLElement;
  domLayer: HTMLIFrameElement;
  domSnapshot: string;
}
