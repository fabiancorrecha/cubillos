/* eslint-disable @typescript-eslint/camelcase */

import moment from 'moment';
import {prop} from 'utils';
import {Budget} from './budget';
import {Procedure} from './procedure';

export type Evaluation = {
  id: number;
  description: string;
  closed: boolean;
  notificationStatus: 'not-notified' | 'notified' | 'notified-twice';
  photos: string[];
  referencePhotos: string[];
  procedures: Procedure[];
  createdAt: string;
  messageCount: number;
  budget?: Budget;
  weight: number;
  height: number;
  budgets?: Budget[];
  status?: number;
  hip_measurement?: string;
  waist_measurement?: string;
  bust_size?: string;
};

type RawPhoto = {
  file_url: string;
};

export type RawEvaluation = {
  id: number;
  description: string;
  status: number;
  notify: number;
  photos: RawPhoto[];
  references: RawPhoto[];
  procedures: Procedure[];
  created_at: string;
  messages_count: number;
  weight: number;
  height: number;
  hip_measurement?: string;
  waist_measurement?: string;
  bust_size?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  budgets: any[];
};

export const Evaluation = {
  fromRawEvaluation: ({
    id,
    description,
    status,
    notify,
    photos,
    references,
    procedures,
    created_at,
    messages_count,
    budgets,
    weight,
    height,
    hip_measurement,
    waist_measurement,
    bust_size,
  }: RawEvaluation): Evaluation => ({
    id,
    description,
    procedures,
    weight,
    height,
    closed: status === 0,
    notificationStatus:
      notify === 0
        ? 'not-notified'
        : notify === 1
        ? 'notified'
        : 'notified-twice',
    photos: photos.map(prop('file_url')),
    referencePhotos: references.map(prop('file_url')),
    createdAt: moment(created_at, 'YYYY-MM-DD HH:mm:ss').format('D MMM'),
    messageCount: messages_count,
    hip_measurement,
    waist_measurement,
    bust_size,
    budget: budgets[0] ? Budget.fromRaw(budgets[0]) : undefined,
  }),
};
