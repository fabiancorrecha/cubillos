import {Currency} from './currency';

export type Price = {
  id: number;
  amount: number;
  currency: Currency;
  type: 'evaluation' | 'appointment';
};

export type RawPrice = {
  id: number;
  amount: number;
  currency: Currency;
  type: number;
};

export const Price = {
  fromRaw: ({id, amount, currency, type}: RawPrice): Price => ({
    id,
    amount,
    currency,
    type: type === 1 ? 'evaluation' : 'appointment',
  }),
};
