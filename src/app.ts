import { Controller } from './assets/services/controller/controller';

export class App {
  private controller: Controller;

  constructor(private readonly rootElement: HTMLElement) {
    this.controller = new Controller(this.rootElement);
    window.location.href = '#/garage';
  }
}
