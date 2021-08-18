import { Car } from './car';

export interface WinnersResp {
  car: Car;
  id: number;
  wins: number;
  time: number;
}
