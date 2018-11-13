
export type Hooks = "play" | "pause";
export interface PlayerClass {
  interval: number; // interval between every frame
  now: number; // current playback time
  playing: boolean; // is it playing now
  options: PlayerOptions;

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
  mouseLayer: HTMLCanvasElement;
  clickLayer: HTMLElement;
  domLayer: HTMLIFrameElement;
  domSnapshot: string;
}