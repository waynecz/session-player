export type Hooks = "play" | "pause";
export interface PlayerClass {
  interval: number; // interval between every frame
  playTimePoint: number; // current play point-in-time
  playing: boolean; // is it playing now
  records?: any[];
  options?: PlayerOptions;

  init(DTO: PlayerInitDTO): void;

  $on(hook: Hooks, action: Function): void; // add subscriber
  $off(hook: Hooks, action: Function): void; // remove subscriber
  $emit(hook: Hooks): any; // dispatch hook

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
