import { Api } from '../api/api';
import { BaseComponent } from '../../components/base-component';
import { Router } from '../router/router';
import { Header } from '../../components/header/header';
import { Garage } from '../../pages/garage/garage';
import { Winners } from '../../pages/winners/winners';
import { Car } from '../../models/car';
import { Cars } from '../../models/cars';
import { WinnerResp } from '../../models/winnerResp';
import { GetWinReq } from '../../models/getWinReq';
import { Store } from '../store/store';
import { delay } from '../../shared/delay';
import {
  GARAG,
  WINNERS,
  WINNERSONPAGE,
  ASCORDER,
  DESCORDER,
} from '../../../constants';

const carNamesForGen = [
  'Tesla',
  'BMW',
  'AUDI',
  'Mercedes',
  'Pego',
  'Reno',
  'Citroen',
  'UAZ',
  'Ford',
  'Lexus',
];
const carModelForGen = [
  'Model S',
  'X5',
  'Q6',
  'W123',
  '309',
  'Duster',
  'C5',
  'Patriot',
  'Galaxy',
  'LS',
];
const MAXCARSONPAGE = 7;

export class Controller {
  private store: Store;

  private rootElement: HTMLElement;

  private api: Api;

  private router: Router;

  private header: Header;

  private garage: Garage;

  private winners: Winners;

  public selectedCar?: {
    selectBtn: BaseComponent;
    name: string;
    color: string;
    id: number;
  } | null;

  private garagePageN = 1;

  private garageCarsN = 0;

  private animationStore: Map<number, { requestID: number }>;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.store = new Store();
    this.animationStore = new Map();
    this.api = new Api();
    this.header = new Header();
    this.rootElement.appendChild(this.header.element);
    this.garage = new Garage(this.store);
    this.rootElement.appendChild(this.garage.element);
    this.winners = new Winners(this.store);
    this.router = new Router();
    this.routerConfigurate();
    this.renderGarage();
    this.renderWinnersTableRows(this.winners.getWinnersView());
    this.listenersWinners();
    this.listenersWinnersTable();
    this.raceBtnListener();
    this.resetBtnListener();
    this.generateCarlistener();
    this.creatCarListener();
    this.updateCarListener();
    this.garageTablelisteners();
  }

  renderGarage = async (): Promise<void> => {
    const cars: Car[] = await (await this.api.getCars(this.garagePageN)).items;
    const totalCount: string | null = await (
      await this.api.getCars(this.garagePageN)
    ).count;
    const updateCarNumber = <HTMLElement>(
      this.store.listeningElements.get('updateCarNumber')
    );
    if (totalCount !== null) {
      updateCarNumber.innerText = `Garage (${totalCount})`;
      this.garageCarsN = Number(totalCount);
    } else {
      updateCarNumber.innerText = 'Garage (0)';
      this.garageCarsN = 0;
    }
    const updateCarPage = <HTMLElement>(
      this.store.listeningElements.get('updateCarPage')
    );
    updateCarPage.innerText = `Page #${this.garagePageN}`;
    this.store.CarsDataStore = [];
    this.garage.garageTable.clearGarage();
    this.garage.garageTable.addCarRows(cars);
    this.garageRowListenersAdd(this.store.CarsDataStore);
  };

  createNewCar = async (newName: string, newColor: string): Promise<void> => {
    await this.api.createCar({ name: newName, color: newColor });
    this.renderGarage();
  };

  removeCar = async (car: Cars): Promise<void> => {
    if (this.selectedCar && this.selectedCar.id === car.id) {
      const updateCarName = <HTMLInputElement>(
        this.store.listeningElements.get('updateCarName')
      );
      const updateCarColor = <HTMLInputElement>(
        this.store.listeningElements.get('updateCarColor')
      );
      updateCarName.value = '';
      updateCarColor.value = '#ffffff';
      this.selectedCar = null;
    }
    await this.api.deleteWinner(car.id);
    await this.api.deleteCar(car.id);
    this.renderGarage();
  };

  selectCar = (
    selectItem:
      | { selectBtn: BaseComponent; name: string; color: string; id: number }
      | undefined
  ): void => {
    const updateCarName = <HTMLInputElement>(
      this.store.listeningElements.get('updateCarName')
    );
    const updateCarColor = <HTMLInputElement>(
      this.store.listeningElements.get('updateCarColor')
    );
    if (selectItem?.id) {
      this.selectedCar = {
        selectBtn: selectItem.selectBtn,
        name: selectItem.name,
        color: selectItem.color,
        id: selectItem.id,
      };
      updateCarName.value = this.selectedCar.name;
      updateCarColor.value = this.selectedCar.color;
    } else {
      this.selectedCar = undefined;
      updateCarName.value = '';
      updateCarColor.value = '#ffffff';
    }
  };

  updateCar = async (newName: string, newColor: string): Promise<void> => {
    if (this.selectedCar) {
      await this.api.updateCar(this.selectedCar?.id, {
        name: newName,
        color: newColor,
      });
      const updateCarName = <HTMLInputElement>(
        this.store.listeningElements.get('updateCarName')
      );
      const updateCarColor = <HTMLInputElement>(
        this.store.listeningElements.get('updateCarColor')
      );
      updateCarName.value = '';
      updateCarColor.value = '#ffffff';
      this.renderGarage();
    }
  };

  generateCars = async (): Promise<void> => {
    for (let i = 0; i < 100; i++) {
      const carModels = carModelForGen.sort(() => Math.random() - 0.5);
      const carNames = carNamesForGen.sort(() => Math.random() - 0.5);
      const name = `${carNames[0]} ${carModels[0]}`;
      const color = `#${Math.random().toString(16).substr(-6)}`;
      this.api.createCar({ name, color });
    }
  };

  renderNextPage = (): void => {
    const maxPage = Math.ceil(this.garageCarsN / MAXCARSONPAGE);
    if (this.garagePageN < maxPage) {
      this.garagePageN++;
      this.renderGarage();
    }
  };

  renderPrevPage = (): void => {
    if (this.garagePageN > 1) {
      this.garagePageN--;
      this.renderGarage();
    }
  };

  checkForReset = async (id: number): Promise<void> => {
    await this.stopDriving(id);
    const statusCheck = this.store.CarsDataStore.find((car) => {
      if (car.start.element.classList.contains('disable')) {
        return true;
      }
      return undefined;
    });
    if (statusCheck === undefined) {
      this.store.CarsDataStore.forEach((car) => {
        if (car.removeBtn.element.classList.contains('disabled')) {
          car.removeBtn.element.classList.remove('disabled');
        }
        if (car.selectBtn.element.classList.contains('disabled')) {
          car.selectBtn.element.classList.remove('disabled');
        }
      });
      const prevBtn = <HTMLElement>this.store.listeningElements.get('prevBtn');
      const nextBtn = <HTMLElement>this.store.listeningElements.get('nextBtn');
      const raceBtn = <HTMLElement>this.store.listeningElements.get('raceBtn');
      const resetBtn = <HTMLElement>(
        this.store.listeningElements.get('resetBtn')
      );
      if (prevBtn.classList.contains('disabled')) {
        prevBtn.classList.remove('disabled');
      }
      if (nextBtn.classList.contains('disabled')) {
        nextBtn.classList.remove('disabled');
      }
      if (raceBtn.classList.contains('disabled')) {
        raceBtn.classList.remove('disabled');
      }
      if (!resetBtn.classList.contains('disabled')) {
        resetBtn.classList.add('disabled');
      }
    }
  };

  startDriving = async (
    id: number
  ): Promise<{ id: number; velocity: number; distance: number }> => {
    const { velocity, distance }: { velocity: number; distance: number } =
      await this.api.startEngine(id);
    return { id, velocity, distance };
  };

  startAnimation = async (
    id: number,
    velocity: number,
    distance: number
  ): Promise<{
    success: boolean | Promise<Response>;
    id: number;
    time: number;
  }> => {
    const carData = <Cars>this.store.CarsDataStore.find((car) => {
      if (car.id === id) {
        return car;
      }
      return undefined;
    });
    const startBtn = carData.start.element;
    const stopBtn = carData.stop.element;
    const car = carData.carModel.element;
    const flag = carData.finishFlag.element;
    startBtn.classList.toggle('disable', true);
    const time = Math.round(distance / velocity);
    stopBtn.classList.toggle('disable', false);
    const htmlDistance =
      Math.floor(this.getDisstanceBetweenElements(car, flag)) +
      flag.offsetWidth;
    const state = this.animation(car, htmlDistance, time);
    if (state && this.animationStore) {
      this.animationStore.set(id, state);
    }
    const { success }: { success: boolean | Promise<Response> } =
      await this.api.getDrive(id);
    if (!success) {
      const frame = this.animationStore.get(id);
      if (frame) {
        window.cancelAnimationFrame(frame.requestID);
      }
    }

    return { success, id, time };
  };

  stopDriving = async (id: number): Promise<void> => {
    const carData = <Cars>this.store.CarsDataStore.find((car) => {
      if (car.id === id) {
        return car;
      }
      return undefined;
    });
    const startBtn = carData.start.element;
    const stopBtn = carData.stop.element;
    const car = carData.carModel.element;
    stopBtn.classList.toggle('disable', true);
    await this.api.stopEngine(id);
    startBtn.classList.toggle('disable', false);
    car.style.transform = 'translateX(0)';
    if (this.animationStore !== null) {
      const frame = this.animationStore.get(id);
      if (frame) {
        window.cancelAnimationFrame(frame.requestID);
      }
    }
  };

  getPositionAtCenter = (element: HTMLElement): { x: number; y: number } => {
    const { top, left, width, height } = element.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
  };

  getDisstanceBetweenElements = (
    car: HTMLElement,
    flag: HTMLElement
  ): number => {
    const carPosition = this.getPositionAtCenter(car);
    const flagPosition = this.getPositionAtCenter(flag);
    return Math.hypot(
      carPosition.x - flagPosition.x,
      carPosition.y - flagPosition.y
    );
  };

  animation = (
    car: HTMLElement,
    distance: number,
    animationTime: number
  ): { requestID: number } => {
    let start: number | null = null;
    let state: { requestID: number };
    function step(timestamp: number) {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const passed = Math.round(time * (distance / animationTime));
      car.style.transform = `translateX(${Math.min(passed, distance)}px)`;
      if (passed < distance) {
        state.requestID = window.requestAnimationFrame(step);
      }
    }

    state = { requestID: window.requestAnimationFrame(step) };
    return state;
  };

  race = async (): Promise<{
    success?: boolean | Promise<Response> | undefined;
    id: number;
    time: number;
  }> => {
    const startedDriveCars = await Promise.all(
      this.store.CarsDataStore.map((car) => this.startDriving(car.id))
    );
    const promises = startedDriveCars.map((car) =>
      this.startAnimation(car.id, car.velocity, car.distance)
    );
    const winner = await this.raceAll(
      promises,
      this.store.CarsDataStore.map((car) => car.id)
    );
    await this.api.saveWinner(winner.id, winner.time);
    this.garage.garageTable.winMessage(<WinnerResp>winner);
    this.renderWinnersTableRows(this.winners.getWinnersView());
    return winner;
  };

  raceAll = async (
    promises: Promise<{
      success: boolean | Promise<Response>;
      id: number;
      time: number;
    }>[],
    ids: number[]
  ): Promise<{
    success?: boolean | Promise<Response>;
    id: number;
    time: number;
  }> => {
    const { success, id, time } = await Promise.race(promises);
    if (!success) {
      const failedIndex = ids.findIndex((i) => i === id);
      const restPromises = [
        ...promises.slice(0, failedIndex),
        ...promises.slice(failedIndex + 1, promises.length),
      ];
      const restIds = [
        ...ids.slice(0, failedIndex),
        ...ids.slice(failedIndex + 1, ids.length),
      ];
      return this.raceAll(restPromises, restIds);
    }
    return {
      ...(<Cars>this.store.CarsDataStore.find((car) => {
        if (car.id === id) {
          return car.id;
        }
        return undefined;
      })),
      time: +(time / 1000).toFixed(2),
    };
  };

  renderWinnersTableRows = async (Request: GetWinReq): Promise<void> => {
    const response = await this.api.getWinners(Request);
    if (response.count === null) {
      this.winners.setTotalWinners(0);
    } else {
      this.winners.setTotalWinners(Number(response.count));
    }
    this.winners.winnerTable.cleanWinnerTable();
    response.items.forEach((winner, index) => {
      this.winners.winnerTable.addCarRow(
        index,
        winner.car.color,
        winner.car.name,
        winner.wins,
        winner.time
      );
    });
  };

  routerConfigurate = (): void => {
    this.router
      .add(`${GARAG}`, () => {
        this.winners.element.replaceWith(this.garage.element);
      })
      .add(`${WINNERS}`, () => {
        this.renderWinnersTableRows(this.winners.getWinnersView());
        this.garage.element.replaceWith(this.winners.element);
      });

    window.addEventListener('hashchange', () => {
      this.router.listen();
    });
  };

  listenersWinners = (): void => {
    const winnersNextBtn = <HTMLElement>(
      this.store.listeningElements.get('winnersNextBtn')
    );
    winnersNextBtn.onclick = (): void => {
      const maxPage = Math.ceil(this.winners.totalWinners / WINNERSONPAGE);
      if (this.winners.winnersView.page + 1 <= maxPage) {
        this.winners.winnersView.page++;
        this.renderWinnersTableRows(this.winners.winnersView);
        this.winners.winnerPage.element.innerText = `Page #${this.winners.winnersView.page}`;
      }
    };
    const winnersPrevBtn = <HTMLElement>(
      this.store.listeningElements.get('winnersPrevBtn')
    );
    winnersPrevBtn.onclick = (): void => {
      if (this.winners.winnersView.page - 1 !== 0) {
        this.winners.winnersView.page--;
        this.renderWinnersTableRows(this.winners.winnersView);
        this.winners.winnerPage.element.innerText = `Page #${this.winners.winnersView.page}`;
      }
    };
  };

  listenersWinnersTable = (): void => {
    const sortWinsBtn = <HTMLElement>(
      this.store.listeningElements.get('sortWinsBtn')
    );
    sortWinsBtn.onclick = (): void => {
      this.winners.winnersView.sort = 'wins';
      if (this.winners.winnersView.order === ASCORDER) {
        this.winners.winnersView.order = DESCORDER;
      } else {
        this.winners.winnersView.order = ASCORDER;
      }
      this.renderWinnersTableRows(this.winners.winnersView);
    };
    const sortTimeBtn = <HTMLElement>(
      this.store.listeningElements.get('sortTimeBtn')
    );
    sortTimeBtn.onclick = (): void => {
      this.winners.winnersView.sort = 'time';
      if (this.winners.winnersView.order === ASCORDER) {
        this.winners.winnersView.order = DESCORDER;
      } else {
        this.winners.winnersView.order = ASCORDER;
      }
      this.renderWinnersTableRows(this.winners.winnersView);
    };
  };

  generateCarlistener = (): void => {
    const generateBtn = <HTMLElement>(
      this.store.listeningElements.get('generateBtn')
    );
    generateBtn.onclick = (): void => {
      this.generateCars().then(() => this.renderGarage());
    };
  };

  raceBtnListener = (): void => {
    const raceBtn = <HTMLElement>this.store.listeningElements.get('raceBtn');
    const resetBtn = <HTMLElement>this.store.listeningElements.get('resetBtn');
    raceBtn.onclick = (): void => {
      if (this.store.CarsDataStore.length !== 0) {
        this.header.disableWinners();
        raceBtn.classList.add('disabled');
        const nextBtn = <HTMLElement>(
          this.store.listeningElements.get('nextBtn')
        );
        const prevBtn = <HTMLElement>(
          this.store.listeningElements.get('prevBtn')
        );
        nextBtn.classList.add('disabled');
        prevBtn.classList.add('disabled');
        this.store.CarsDataStore.forEach((car) => {
          car.removeBtn.element.classList.add('disabled');
          car.selectBtn.element.classList.add('disabled');
        });
        this.race().then(() => {
          resetBtn.classList.remove('disabled');
        });
      }
    };
  };

  resetBtnListener = (): void => {
    const raceBtn = <HTMLElement>this.store.listeningElements.get('raceBtn');
    const resetBtn = <HTMLElement>this.store.listeningElements.get('resetBtn');
    resetBtn.onclick = (): void => {
      Promise.all(
        this.store.CarsDataStore.map((car) => this.stopDriving(car.id))
      ).then(() => {
        resetBtn.classList.add('disabled');
        this.store.CarsDataStore.forEach((car) => {
          car.removeBtn.element.classList.remove('disabled');
          car.selectBtn.element.classList.remove('disabled');
          const nextBtn = <Element>this.store.listeningElements.get('nextBtn');
          const prevBtn = <Element>this.store.listeningElements.get('prevBtn');
          nextBtn.classList.remove('disabled');
          prevBtn.classList.remove('disabled');
        });
        delay(1000).then(() => {
          raceBtn.classList.remove('disabled');
        });
      });
    };
  };

  creatCarListener = (): void => {
    const creatCarBtn = <HTMLInputElement>(
      this.store.listeningElements.get('createCarBtn')
    );
    const creatCarName = <HTMLInputElement>(
      this.store.listeningElements.get('createCarName')
    );
    const creatCarColor = <HTMLInputElement>(
      this.store.listeningElements.get('createCarColor')
    );
    creatCarBtn.onclick = (): void => {
      this.createNewCar(creatCarName.value, creatCarColor.value);
      creatCarName.value = '';
    };
  };

  updateCarListener = (): void => {
    const updateCarBtn = <HTMLInputElement>(
      this.store.listeningElements.get('updateCarBtn')
    );
    const updateCarName = <HTMLInputElement>(
      this.store.listeningElements.get('updateCarName')
    );
    const updateCarColor = <HTMLInputElement>(
      this.store.listeningElements.get('updateCarColor')
    );
    updateCarBtn.onclick = (): void => {
      if (updateCarBtn.value !== '') {
        this.updateCar(updateCarName.value, updateCarColor.value);
        updateCarName.value = '';
      }
    };
  };

  garageTablelisteners = (): void => {
    const nextBtn = <HTMLElement>this.store.listeningElements.get('nextBtn');
    const prevBtn = <HTMLElement>this.store.listeningElements.get('prevBtn');
    nextBtn.onclick = (): void => {
      this.renderNextPage();
    };
    prevBtn.onclick = (): void => {
      this.renderPrevPage();
    };
  };

  garageRowListenersAdd = (cars: Cars[]): void => {
    const carsArr = cars;
    carsArr.forEach((car) => {
      const removeBtn = car.removeBtn.element;
      const selectBtn = car.selectBtn.element;
      const startBtn = car.start.element;
      const stopBtn = car.stop.element;
      removeBtn.onclick = (): void => {
        this.removeCar(car);
      };
      selectBtn.onclick = (): void => {
        this.selectBtnSwitch(car);
      };
      startBtn.onclick = (): void => {
        const drive = async () => {
          this.header.disableWinners();
          const moveData = await this.startDriving(car.carModel.getId());
          this.startAnimation(
            moveData.id,
            moveData.velocity,
            moveData.distance
          );
        };
        drive();
      };
      stopBtn.onclick = (): void => {
        this.checkForReset(car.id);
      };
    });
  };

  selectBtnSwitch = (car: Cars): void => {
    if (car.selectBtn.element.classList.contains('active')) {
      this.selectCar(undefined);
      car.selectBtn.element.classList.remove('active');
    } else {
      if (this.selectedCar) {
        this.selectedCar.selectBtn.element.classList.remove('active');
      }
      this.selectCar({
        selectBtn: car.selectBtn,
        name: car.carModel.getName(),
        color: car.carModel.getColor(),
        id: car.carModel.getId(),
      });
      car.selectBtn.element.classList.add('active');
    }
  };
}
