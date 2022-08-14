import {Procedure} from './procedure';

export type Budget = {
  id: number;
  amount: number;
  currency: string;
  procedures: Procedure[];
};

export const Budget = {
  fromRaw: ({
    id,
    amount,
    currency: {code},
    procedures,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [_: string]: any;
  }): Budget => ({
    id,
    amount,
    procedures,
    currency: code,
  }),
};
