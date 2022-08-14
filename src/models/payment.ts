/* eslint-disable @typescript-eslint/camelcase */

import moment from 'moment';
import {Appointment, RawAppointment} from './appointment';
import {Currency} from './currency';
import {Evaluation, RawEvaluation} from './evaluation';

export type Payment = {
  id: number;
  amount: number;
  currency: Currency;
  evaluation: Evaluation | null;
  appointment: Appointment | null;
  responseCode: string;
  method: 'paypal' | 'payco';
  date: Date;
};

export type RawPayment = {
  id: number;
  amount: number;
  currency: Currency;
  evaluation: RawEvaluation | null;
  appointment: RawAppointment | null;
  response_code: string;
  method_id: number;
  created_at: string;
};

export const Payment = {
  fromRaw: ({
    id,
    amount,
    currency,
    evaluation,
    appointment,
    response_code,
    method_id,
    created_at,
  }: RawPayment): Payment => ({
    id,
    amount,
    currency,
    evaluation: evaluation ? Evaluation.fromRawEvaluation(evaluation) : null,
    appointment: appointment ? Appointment.fromRaw(appointment) : null,
    responseCode: response_code,
    method: method_id === 1 ? 'paypal' : 'payco',
    date: moment(created_at).toDate(),
  }),
};
