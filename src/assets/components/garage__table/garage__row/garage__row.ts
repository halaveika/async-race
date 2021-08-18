import './garage__row.scss';
import { BaseComponent } from '../../base-component';
import { CarModel } from '../carModel/carModel';
import { Car } from '../../../models/car';
import { Store } from '../../../services/store/store';

export class GarageRow extends BaseComponent {
  private store: Store;

  private selectBtn: BaseComponent;

  private removeBtn: BaseComponent;

  private startBtn: BaseComponent;

  private stopBtn: BaseComponent;

  private carName: BaseComponent;

  private carModel: CarModel;

  private rowControl: BaseComponent;

  private finishFlag: BaseComponent;

  constructor(car: Car, store: Store) {
    super('div', ['garage__row']);
    this.store = store;
    this.rowControl = this.render('div', ['row__control']);
    this.selectBtn = new BaseComponent('span', [
      'garage__select-btn',
      'garage__btn',
    ]);
    this.rowControl.element.appendChild(this.selectBtn.element);
    this.selectBtn.element.innerText = 'select';
    this.removeBtn = new BaseComponent('span', [
      'garage__remove-btn',
      'garage__btn',
    ]);
    this.rowControl.element.appendChild(this.removeBtn.element);
    this.removeBtn.element.innerText = 'remove';
    this.carName = new BaseComponent('span', ['garage__car-name']);
    this.rowControl.element.appendChild(this.carName.element);
    this.carName.element.innerText = car.name;
    this.startBtn = new BaseComponent('span', ['garage__start-btn']);
    this.rowControl.element.appendChild(this.startBtn.element);
    this.startBtn.element.innerText = 'A';
    this.stopBtn = new BaseComponent('span', ['garage__stop-btn', 'disable']);
    this.rowControl.element.appendChild(this.stopBtn.element);
    this.stopBtn.element.innerText = 'B';
    this.stopBtn.element.id = `stop${car.id}`;
    this.carModel = new CarModel(car.id, car.name, car.color);
    this.element.appendChild(this.carModel.element);
    this.finishFlag = new BaseComponent('div', ['finish-flag']);
    this.element.appendChild(this.finishFlag.element);
    this.store.CarsDataStore.push({
      id: car.id,
      start: this.startBtn,
      stop: this.stopBtn,
      carModel: this.carModel,
      finishFlag: this.finishFlag,
      removeBtn: this.removeBtn,
      selectBtn: this.selectBtn,
    });
  }
}
