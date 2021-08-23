import { GetWinReq } from '../../models/getWinReq';
import { WinnerResp } from '../../models/winnerResp';
import { WinnersResp } from '../../models/winnersResp';
import { Car } from '../../models/car';
import { GARAG, WINNERS, ENGINE, PATH } from '../../../constants';

const garage = `${PATH}/${GARAG}`;
const engine = `${PATH}/${ENGINE}`;
const winners = `${PATH}/${WINNERS}`;

export class Api {
  private response?: Promise<Response>;

  private totalWinners?: number;

  getCars = async (
    page: number,
    limit = 7
  ): Promise<{
    items: Promise<Car[]>;
    count: string | null;
  }> => {
    this.response = new Promise((resolve) =>
      resolve(fetch(`${garage}?_page=${page}&_limit=${limit}`))
    );
    return {
      items: (await this.response).json(),
      count: (await this.response).headers.get('X-Total-Count'),
    };
  };

  getCar = async (id: number): Promise<Car> =>
    (await fetch(`${garage}/${id}`)).json();

  createCar = async (body: { name: string; color: string }): Promise<void> =>
    (
      await fetch(garage, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json();

  deleteCar = async (id: number): Promise<void> =>
    (await fetch(`${garage}/${id}`, { method: 'DELETE' })).json();

  updateCar = async (
    id: number,
    body: { name: string; color: string }
  ): Promise<void> =>
    (
      await fetch(`${garage}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json();

  startEngine = async (
    id: number
  ): Promise<{ velocity: number; distance: number }> =>
    (await fetch(`${engine}?id=${id}&status=started`)).json();

  stopEngine = async (id: number): Promise<void> =>
    (await fetch(`${engine}?id=${id}&status=stopped`)).json();

  getDrive = async (
    id: number
  ): Promise<{ success: boolean | Promise<Response> }> => {
    const response: Response = await fetch(
      `${engine}?id=${id}&status=drive`
    ).catch();
    return response.status !== 200
      ? { success: false }
      : { ...(await response.json()) };
  };

  getSortOrder = (sort: string, order: string): string => {
    if (sort && order) return `&_sort=${sort}&_order=${order}`;
    return '';
  };

  getWinners = async ({
    page,
    limit = 10,
    sort,
    order,
  }: GetWinReq): Promise<{ items: WinnersResp[]; count: string | null }> => {
    const response = await fetch(
      `${winners}?_page=${page}&_limit=${limit}${this.getSortOrder(
        sort,
        order
      )}`
    );
    if (Number(response.headers.get('X-Total-Count')) !== undefined) {
      this.totalWinners = Number(response.headers.get('X-Total-Count'));
    }
    const data = await response.json();
    return {
      items: await Promise.all(
        data.map(async (winner: WinnerResp) => ({
          ...winner,
          car: await this.getCar(winner.id),
        }))
      ),
      count: response.headers.get('X-Total-Count'),
    };
  };

  checkWinners = async (id: number): Promise<boolean> => {
    const response = this.getWinners({
      page: 1,
      limit: this.totalWinners || 0,
      sort: 'id',
      order: 'ASC',
    });
    const winnerArr = (await response).items.map((car) => car.id);
    const result = winnerArr.find((element) => element === id);
    if (result !== undefined) return true;
    return false;
  };

  getWinner = async (id: number): Promise<WinnerResp> =>
    (await fetch(`${winners}/${id}`)).json();

  deleteWinner = async (id: number): Promise<void> => {
    if (await this.checkWinners(id)) {
      (await fetch(`${winners}/${id}`, { method: 'DELETE' })).json();
    }
  };

  createWinner = async (body: WinnerResp): Promise<void> =>
    (
      await fetch(winners, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json();

  updateWinner = async (id: number, body: WinnerResp): Promise<void> =>
    (
      await fetch(`${winners}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json();

  saveWinner = async (id: number, time: number): Promise<void> => {
    if (!(await this.checkWinners(id))) {
      await this.createWinner({
        id,
        wins: 1,
        time,
      });
    } else {
      const winner = await this.getWinner(id);
      await this.updateWinner(id, {
        id,
        wins: winner.wins + 1,
        time: time < winner.time ? time : winner.time,
      });
    }
  };
}
