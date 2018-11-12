export interface PlayerClass {
    interval: number
    now: number
    playing: boolean

    play(): void
    pause(): void
    jump(): void
    play(): void
    init(): void
}

class Player implements PlayerClass{
  public interval = 60;
  public now = 0;
  public playing = false;

  constructor() {}

  private loadDocument() {}

  public play() {}

  public pause() {}

  public jump() {}

  private nextFrame() {}

  init() {}
}

export default new Player();
