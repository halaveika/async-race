import './winner__table.scss';
import { BaseComponent } from '../base-component';
import { Store } from '../../services/store/store';
import { GetWinReq } from '../../models/getWinReq';
import { WINNERSPAGINATION } from '../../../constants';

export class WinnerTable extends BaseComponent {
  private store: Store;

  private tableHead: BaseComponent;

  private sortWinsBtn: BaseComponent;

  private sortTimeBtn: BaseComponent;

  private tableBody: BaseComponent;

  private winnerView: GetWinReq;

  constructor(store: Store, winnersView: GetWinReq) {
    super('table', ['winner__table']);
    this.store = store;
    this.winnerView = winnersView;
    this.tableHead = new BaseComponent('thead', ['winner__thead']);
    const tr = new BaseComponent('tr', ['tr__thead']);
    tr.element.innerHTML = `
    <th id='t1'>Number</th>
    <th id='t2'>Car</th>
    <th id='t3'>Name</th>
    `;
    this.tableHead.element.appendChild(tr.element);
    this.sortWinsBtn = new BaseComponent('th', ['winner__sort-wins-btn']);
    tr.element.appendChild(this.sortWinsBtn.element);
    this.sortWinsBtn.element.innerText = 'Wins';
    this.sortTimeBtn = new BaseComponent('th', ['winner__sort-time-btn']);
    this.sortTimeBtn.element.innerText = 'Best time (seconds)';
    tr.element.appendChild(this.sortTimeBtn.element);
    this.element.appendChild(this.tableHead.element);
    this.tableBody = new BaseComponent('tbody', ['winner__tbody']);
    this.element.appendChild(this.tableBody.element);
    this.store.subscribe('sortWinsBtn', this.sortWinsBtn.element);
    this.store.subscribe('sortTimeBtn', this.sortTimeBtn.element);
  }

  cleanWinnerTable = (): void => {
    this.tableBody.element.innerHTML = '';
  };

  addCarRow = (
    index: number,
    color: string,
    name: string,
    wins: number,
    time: number
  ): void => {
    const newRow = new BaseComponent('tr', ['winner__tr']);
    const CarIndexOnCurrentPage = index + 1;
    const currentIndex =
      CarIndexOnCurrentPage + (this.winnerView.page - 1) * WINNERSPAGINATION;
    let svg =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
    svg +=
      ' xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" x="0" y="0" viewBox="0 0 512 512"';
    svg +=
      '< style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1,0,';
    svg +=
      '0,1,0,50)"><g xmlns="http://www.w3.org/2000/svg" id="_02-car" data-name="02-car"><g';
    svg +=
      ' id="glyph"><path d="M112,340a60,60,0,1,0,60,60A60.068,60.068,0,0,0,112,340Zm0,92a32,32,0,1,1,';
    svg += `32-32A32,32,0,0,1,112,432Z" fill=${color} data-original="#000000" style="" class=""/><path`;
    svg +=
      ' d="M416,340a60,60,0,1,0,60,60A60.068,60.068,0,0,0,416,340Zm0,92a32,32,0,1,1,32-32A32,32,0,0,1,416,';
    svg += `432Z" fill=${color} data-original="#000000" style="" class=""/><path d="M500.584,300.613C460.`;
    svg +=
      '874,284.231,400,256,400,256l-48.483-78.7a35.857,35.857,0,0,0-27.94-13.3H83.777a43.762,43.762,0,0,';
    svg +=
      '0-39.355,24.322L8.645,259.878A43.992,43.992,0,0,0,4,279.554V376a36,36,0,0,0,36,36h1.019a72,72,0,1,';
    svg +=
      '1,141.962,0H345.019a72.005,72.005,0,1,1,142.461-3.492A36,36,0,0,0,508,376V311.7A11.99,11.99,0,0,0,';
    svg +=
      '500.584,300.613ZM60.4,247.245A15.988,15.988,0,0,1,46.139,256H30.584s25.4-50.338,34.949-68.565A12,';
    svg +=
      '12,0,0,1,76.164,181H85.99a5,5,0,0,1,4.472,7.241l-.04.081S69.684,228.945,60.4,247.245ZM112,';
    svg +=
      '300H96a12,12,0,0,1,0-24h16a12,12,0,0,1,0,24Zm108-56a12,12,0,0,1-11.994,12H100.6a12,12,0,0,1-10.';
    svg +=
      '67-17.484c8.419-16.366,20.612-39.93,26.594-51.154A12,12,0,0,1,127.111,181H208a12,12,0,0,1,12,';
    svg +=
      '12Zm68,56H273a12,12,0,0,1,0-24h15a12,12,0,0,1,0,24Zm-20-44a12,12,0,0,1-12-12V193a12,12,0,0,1,';
    svg += `12-12h65.8L380,256Z" fill=${color} data-original="#000000" style="" class=""/></g></g></g></svg>`;
    newRow.element.innerHTML = `
      <th>${currentIndex}</th>
      <th>${svg}</th>
      <th>${name}</th>
      <th>${wins}</th>
      <th>${time}</th>
    `;
    this.tableBody.element.appendChild(newRow.element);
  };
}
