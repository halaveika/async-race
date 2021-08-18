import './garage__control-bar.scss';
import { BaseComponent } from '../base-component';
import { GarageBasicBar } from './garage__basic-bar/garage__basic-bar';
import { Store } from '../../services/store/store';

export class GarageControlBar extends BaseComponent {
  private store: Store;

  private garageCreateBar: GarageBasicBar;

  private garageUpdateBar: GarageBasicBar;

  private raceBtn: BaseComponent;

  private resetBtn: BaseComponent;

  private generateBtn: BaseComponent;

  constructor(store: Store) {
    super('div', ['garage__control-bar']);
    this.store = store;
    this.garageCreateBar = new GarageBasicBar(this.store, 'create');
    this.element.appendChild(this.garageCreateBar.element);
    this.garageUpdateBar = new GarageBasicBar(this.store, 'update');
    this.element.appendChild(this.garageUpdateBar.element);
    this.raceBtn = new BaseComponent('span', [
      'garage__race-btn',
      'garage__btn',
    ]);
    this.element.appendChild(this.raceBtn.element);
    this.raceBtn.element.innerText = 'race';
    this.store.subscribe('raceBtn', this.raceBtn.element);
    this.resetBtn = new BaseComponent('span', [
      'garage__reset-btn',
      'garage__btn',
      'disabled',
    ]);
    this.element.appendChild(this.resetBtn.element);
    this.resetBtn.element.innerText = 'reset';
    this.store.subscribe('resetBtn', this.resetBtn.element);
    this.generateBtn = new BaseComponent('span', ['garage__generate-btn']);
    this.element.appendChild(this.generateBtn.element);
    this.generateBtn.element.innerText = 'generate cars';
    this.store.subscribe('generateBtn', this.generateBtn.element);
  }
}
