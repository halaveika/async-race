import { Cars } from '../../models/cars';

export class Store {
  public CarsDataStore: Cars[] = [];

  public listeningElements: Map<string, HTMLElement | HTMLInputElement>;

  constructor() {
    this.listeningElements = new Map();
  }

  subscribe = (key: string, element: HTMLElement | HTMLInputElement): void => {
    this.listeningElements.set(key, element);
  };
}
