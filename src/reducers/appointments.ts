import {AppointmentsAction, AppointmentsState} from 'actions/appointments';
import {Appointment, AppointmentStatus} from 'models/appointment';
import {Reducer} from 'redux';
import {exhaustiveCheck} from 'utils';

const updateAppointmentStatus = (
  state: Appointment[],
  appointmentId: number,
  status: AppointmentStatus,
): Appointment[] => {
  const index = state.findIndex(({id}) => id === appointmentId);
  if (index > -1) {
    const newState = [...state];
    newState[index].status = status;

    return newState;
  }

  return state;
};

export const appointments: Reducer<AppointmentsState, AppointmentsAction> = (
  state = [],
  action,
) => {
  switch (action.type) {
    case 'Appointments/SET':
      return action.appointments;

    case 'Appointments/CONFIRM':
      return updateAppointmentStatus(state, action.appointmentId, 'confirmed');

    case 'Appointments/CANCEL':
      return updateAppointmentStatus(state, action.appointmentId, 'canceled');

    case 'Appointments/FINISH':
      return updateAppointmentStatus(state, action.appointmentId, 'done');

    default:
      exhaustiveCheck(action);
      return state;
  }
};
