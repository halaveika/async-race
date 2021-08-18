import { BaseComponent } from '../../components/base-component';
import { GarageControlBar } from '../../components/garage__control-bar/garage__control-bar';
import { GarageTable } from '../../components/garage__table/garage__table';
import { Store } from '../../services/store/store';

export class Garage extends BaseComponent {
  private store: Store;

  private garageControlBar: GarageControlBar;

  public garageTable: GarageTable;

  constructor(store: Store) {
    super('div', ['garage']);
    this.store = store;
    this.garageControlBar = new GarageControlBar(this.store);
    this.element.appendChild(this.garageControlBar.element);
    this.garageTable = new GarageTable(this.store);
    this.element.appendChild(this.garageTable.element);
  }
}
