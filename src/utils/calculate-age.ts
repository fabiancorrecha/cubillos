import moment, {Moment} from 'moment';

export const calculateAge = (birthday: Date | Moment) =>
  moment().diff(birthday, 'years');
