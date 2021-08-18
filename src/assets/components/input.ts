export class Input {
  readonly element: HTMLInputElement;

  constructor(
    tag: keyof HTMLElementTagNameMap = 'input',
    styles: string[] = [],
    type: string,
  ) {
    this.element = <HTMLInputElement>document.createElement(tag);
    this.element.classList.add(...styles);
    this.element.setAttribute('type', type);
  }
}
