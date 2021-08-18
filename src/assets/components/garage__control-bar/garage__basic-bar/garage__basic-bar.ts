import './garage__basic-bar.scss';
import { BaseComponent } from '../../base-component';
import { Input } from '../../input';
import { Store } from '../../../services/store/store';

export class GarageBasicBar extends BaseComponent {
  private store: Store;

  private CarName: Input;

  private CarColor: Input;

  private CarBtn: Input;

  constructor(store: Store, type: string) {
    super('div', ['garage__bar']);
    this.store = store;
    this.CarName = new Input('input', ['garage__bar-car-name'], 'text');
    this.element.appendChild(this.CarName.element);
    this.CarColor = new Input('input', ['garage__bar-car-color'], 'color');
    this.CarColor.element.value = '#ffffff';
    this.element.appendChild(this.CarColor.element);
    this.CarBtn = new Input('input', ['garage__bar-car-btn'], 'submit');
    this.CarBtn.element.value = `${type}`;
    this.element.appendChild(this.CarBtn.element);
    this.store.subscribe(`${type}CarBtn`, this.CarBtn.element);
    this.store.subscribe(`${type}CarName`, this.CarName.element);
    this.store.subscribe(`${type}CarColor`, this.CarColor.element);
  }
}
