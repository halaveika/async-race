import { BaseComponent } from '../components/base-component';
import { CarModel } from '../components/garage__table/carModel/carModel';

export interface Cars {
  id: number;
  start: BaseComponent;
  stop: BaseComponent;
  carModel: CarModel;
  finishFlag: BaseComponent;
  removeBtn: BaseComponent;
  selectBtn: BaseComponent;
}
