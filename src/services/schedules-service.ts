import {useSocketEvent} from 'hooks';
import {Schedule} from 'models/schedule';
import {axios} from './axios';

export class SchedulesService {
  static get(date: string, shift: number): Promise<Schedule | null> {
    return new Promise((resolve, reject) =>
      axios
        .get(`schedules/${date}/${shift}`)
        .then(({data}) => resolve(data))
        .catch(reject),
    );
  }

  static useReloadScheduleListener(listener: () => void): void {
    useSocketEvent('schedule/reload', listener);
  }
}
