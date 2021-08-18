import { BaseComponent } from './base-component';

export class PaginationComponent extends BaseComponent {
  constructor(type: string) {
    super('button', ['pagination-btn']);
    this.element.innerText = type;
  }
}
