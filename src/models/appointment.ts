import {Payment, RawPayment} from './payment';
import {fromRawUser, RawUser, User} from './user';
import {Prescription} from './prescription';

export type AppointmentStatus = 'pending' | 'confirmed' | 'done' | 'canceled';

export type Appointment = {
  id: number;
  user: User;
  description: string;
  date: string;
  status: AppointmentStatus;
  payment: Payment | null;
  prescriptions: Prescription[];
};

export type RawAppointment = {
  id: number;
  user: RawUser;
  description: string;
  date: string;
  status: number;
  payment: RawPayment;
  recipes: Prescription[];
};

export const Appointment = {
  fromRaw: ({
    id,
    user,
    description,
    date,
    status,
    payment,
    recipes,
  }: RawAppointment): Appointment => ({
    id,
    description,
    date,
    user: fromRawUser(user),
    payment: payment ? Payment.fromRaw(payment) : null,
    status:
      status === 0
        ? 'pending'
        : status === 1
        ? 'confirmed'
        : status === 2
        ? 'done'
        : 'canceled',
    prescriptions: recipes,
  }),
};
