/* eslint-disable @typescript-eslint/camelcase */

import {useSocketEvent} from 'hooks';
import {Appointment} from 'models/appointment';
import {axios} from './axios';

type AppointmentEvent = {
  id: number;
};

export const AppointmentsService = {
  index: (userId?: number): Promise<Appointment[]> =>
    new Promise((resolve, reject) =>
      axios
        .get(`appointments${userId ? `?user_id=${userId}` : ''}`)
        .then(({data}) => {
          resolve(data.map(Appointment.fromRaw));
        })
        .catch(reject),
    ),

  store: (
    userId: number,
    description: string,
    date: string,
    scheduleId: number,
    payment: string,
    gender?: string,
    diseases?: string,
    medicines?: string,
    previous_procedures?: string,
    allergies?: string,
    birthdate?: string
  ): Promise<void> =>
    axios.post('appointments', {
      user_id: userId,
      description,
      date,
      schedule_id: scheduleId,
      payment,
      gender,
      diseases,
      medicines,
      previous_procedures,
      allergies,
      birthdate
    }),

  storeFailedPayment: (payment: string): Promise<void> =>
    axios.post('appointments/payment-failed', payment, {
      headers: {'Content-Type': 'application/json'},
    }),

  confirm: (appointmentId: number): Promise<void> =>
    axios.put(`appointments/${appointmentId}/confirm`),

  cancel: (appointmentId: number): Promise<void> =>
    axios.put(`appointments/${appointmentId}/cancel`),

  useCancelListener: (listener: ({id}: AppointmentEvent) => void): void =>
    useSocketEvent('appointments/cancel', listener),

  useFinishListener: (listener: ({id}: AppointmentEvent) => void): void =>
    useSocketEvent('appointments/finish', listener),

  useConfirmListener: (listener: ({id}: AppointmentEvent) => void): void =>
    useSocketEvent('appointments/confirm', listener),
};
