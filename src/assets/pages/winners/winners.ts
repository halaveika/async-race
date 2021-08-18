import './winners.scss';
import { BaseComponent } from '../../components/base-component';
import { Store } from '../../services/store/store';
import { WinnerTable } from '../../components/winner__table/winner__table';
import { GetWinReq } from '../../models/getWinReq';
import { PaginationComponent } from '../../components/paginationComponent';

export class Winners extends BaseComponent {
  public totalWinners = 0;

  private store: Store;

  public winnerTable: WinnerTable;

  private winnerTitle: BaseComponent;

  public winnerPage: BaseComponent;

  private prevBtn: PaginationComponent;

  private nextBtn: PaginationComponent;

  public winnersView: GetWinReq = {
    page: 1,
    limit: 10,
    sort: 'id',
    order: 'ASC',
  };

  constructor(store: Store) {
    super('div', ['winners']);
    this.store = store;
    this.winnerTitle = new BaseComponent('span', ['winner__title']);
    this.element.appendChild(this.winnerTitle.element);
    this.winnerTitle.element.innerText = `Winners (${this.totalWinners})`;
    this.winnerPage = new BaseComponent('span', ['winner__page']);
    this.element.appendChild(this.winnerPage.element);
    this.winnerPage.element.innerText = `Page #${this.winnersView.page}`;
    this.winnerTable = new WinnerTable(this.store, this.winnersView);
    this.element.appendChild(this.winnerTable.element);
    const viewControl = new BaseComponent('div', ['winner__view-control']);
    this.element.appendChild(viewControl.element);
    this.prevBtn = new PaginationComponent('prev');
    viewControl.element.appendChild(this.prevBtn.element);
    this.nextBtn = new PaginationComponent('next');
    viewControl.element.appendChild(this.nextBtn.element);
    this.store.subscribe('winnersNextBtn', this.nextBtn.element);
    this.store.subscribe('winnersPrevBtn', this.prevBtn.element);
  }

  setTotalWinners = (totalWinners: number): void => {
    this.totalWinners = totalWinners;
    this.winnerTitle.element.innerText = `Winners (${this.totalWinners})`;
  };

  getWinnersView = (): GetWinReq => this.winnersView;
}
