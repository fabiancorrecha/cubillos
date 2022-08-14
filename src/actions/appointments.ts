import {Appointment} from 'models/appointment';
import {Action} from 'redux';

export interface SetAppointmentsAction extends Action<'Appointments/SET'> {
  appointments: Appointment[];
}

export interface ConfirmAppointmentAction
  extends Action<'Appointments/CONFIRM'> {
  appointmentId: number;
}

export interface CancelAppointmentAction extends Action<'Appointments/CANCEL'> {
  appointmentId: number;
}

export interface FinishAppointmentAction extends Action<'Appointments/FINISH'> {
  appointmentId: number;
}

export type AppointmentsAction =
  | SetAppointmentsAction
  | ConfirmAppointmentAction
  | CancelAppointmentAction
  | FinishAppointmentAction;

export type AppointmentsState = Appointment[];

export const setAppointments = (
  appointments: Appointment[],
): AppointmentsAction => ({type: 'Appointments/SET', appointments});

export const confirmAppointment = (
  appointmentId: number,
): AppointmentsAction => ({
  type: 'Appointments/CONFIRM',
  appointmentId,
});

export const cancelAppointment = (
  appointmentId: number,
): AppointmentsAction => ({
  type: 'Appointments/CANCEL',
  appointmentId,
});

export const finishAppointment = (
  appointmentId: number,
): AppointmentsAction => ({
  type: 'Appointments/FINISH',
  appointmentId,
});
