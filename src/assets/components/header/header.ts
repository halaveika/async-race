import './header.scss';
import { BaseComponent } from '../base-component';
import { delay } from '../../shared/delay';
import { GARAG, WINNERS } from '../../../constants';

export class Header extends BaseComponent {
  private toGarageBtn: BaseComponent;

  private toWinnersBtn: BaseComponent;

  constructor() {
    super('header', ['header']);
    this.toGarageBtn = new BaseComponent('span', [
      'header__garage-btn',
      'active',
    ]);
    this.element.appendChild(this.toGarageBtn.element);
    this.toGarageBtn.element.innerText = 'to garage';
    this.toGarageBtn.element.addEventListener(
      'click',
      (event: Event): void => {
        this.highlightRout(event);
        window.location.href = `#/${GARAG}`;
      },
      false
    );
    this.toWinnersBtn = new BaseComponent('span', [
      'header__winners-btn',
      'garage__btn',
    ]);
    this.element.appendChild(this.toWinnersBtn.element);
    this.toWinnersBtn.element.innerText = 'to winners';
    this.toWinnersBtn.element.addEventListener(
      'click',
      (event: Event): void => {
        this.highlightRout(event);
        window.location.href = `#/${WINNERS}`;
      },
      false
    );
  }

  highlightRout = (event: Event): void => {
    const currentItem = <HTMLElement>event.target;
    if (this.toGarageBtn.element.classList.contains('active')) {
      this.toGarageBtn.element.classList.remove('active');
    }
    if (this.toWinnersBtn.element.classList.contains('active')) {
      this.toWinnersBtn.element.classList.remove('active');
    }
    currentItem.classList.add('active');
  };

  disableWinners = (): void => {
    this.toWinnersBtn.element.classList.add('disabled');
    delay(2500).then(() =>
      this.toWinnersBtn.element.classList.remove('disabled')
    );
  };
}
