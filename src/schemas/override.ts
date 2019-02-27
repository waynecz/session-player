export interface MyWindow extends Window {
  requestIdleCallback?: any;
  [key: string]: any;
}

export const myWindow: MyWindow = window;

export interface ElementX extends HTMLElement {}
