import './garage__table.scss';
import { BaseComponent } from '../base-component';
import { PaginationComponent } from '../paginationComponent';
import { GarageRow } from './garage__row/garage__row';
import { Car } from '../../models/car';
import { Store } from '../../services/store/store';
import { Cars } from '../../models/cars';
import { WinnerResp } from '../../models/winnerResp';
import { delay } from '../../shared/delay';

export class GarageTable extends BaseComponent {
  private store: Store;

  private garageTitle: BaseComponent;

  private garagePage: BaseComponent;

  private garageBox: BaseComponent;

  private garageRow?: GarageRow;

  private prevBtn: PaginationComponent;

  private nextBtn: PaginationComponent;

  constructor(store: Store) {
    super('div', ['garage__table']);
    this.store = store;
    this.garageTitle = new BaseComponent('span', ['garage__title']);
    this.element.appendChild(this.garageTitle.element);
    this.garageTitle.element.innerText = 'Garage';
    this.garagePage = new BaseComponent('span', ['garage__page']);
    this.element.appendChild(this.garagePage.element);
    this.garagePage.element.innerText = 'Page #1';
    this.garageBox = new BaseComponent('div', ['garage__box']);
    this.element.appendChild(this.garageBox.element);
    const viewControl = new BaseComponent('div', ['garage__view-control']);
    this.element.appendChild(viewControl.element);
    this.prevBtn = new PaginationComponent('prev');
    viewControl.element.appendChild(this.prevBtn.element);
    this.prevBtn.element.classList.add('garage__btn');
    this.nextBtn = new PaginationComponent('next');
    viewControl.element.appendChild(this.nextBtn.element);
    this.nextBtn.element.classList.add('garage__btn');
    this.store.subscribe('updateCarNumber', this.garageTitle.element);
    this.store.subscribe('updateCarPage', this.garagePage.element);
    this.store.subscribe('prevBtn', this.prevBtn.element);
    this.store.subscribe('nextBtn', this.nextBtn.element);
  }

  addCarRows = (cars: Car[]): void => {
    cars.forEach((car) => {
      this.garageRow = new GarageRow(car, this.store);
      this.garageBox.element.appendChild(this.garageRow.element);
    });
  };

  clearGarage = (): void => {
    this.garageBox.element.innerHTML = '';
  };

  winMessage = (winner: WinnerResp): void => {
    const winnerData = <Cars> this.store.CarsDataStore.find((car) => {
      if (car.id === winner.id) {
        return car;
      }
      return undefined;
    });
    const name = winnerData.carModel.getName();
    const message = new BaseComponent('span', ['win__messsage']);
    message.element.innerText = `${name} went first [${winner.time}sec]!`;
    this.element.appendChild(message.element);
    delay(2000).then(() => message.element.remove());
  };
}
