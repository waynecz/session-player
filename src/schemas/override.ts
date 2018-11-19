export interface MyWindow extends Window {
  requestIdleCallback: any;
  [key: string]: any
}

export interface ElementX extends HTMLElement {}