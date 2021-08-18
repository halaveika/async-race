export class BaseComponent {
  readonly element: HTMLElement;

  constructor(tag: keyof HTMLElementTagNameMap = 'div', styles: string[] = []) {
    this.element = document.createElement(tag);
    this.element.classList.add(...styles);
  }

  render(
    tag: keyof HTMLElementTagNameMap = 'div',
    styles: string[] = [],
  ): BaseComponent {
    const element = new BaseComponent(tag, styles);
    this.element.appendChild(element.element);
    return element;
  }
}
