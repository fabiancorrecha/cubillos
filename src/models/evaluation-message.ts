import moment from 'moment';
import {fromRawUser, RawUser, User} from './user';

/* eslint-disable @typescript-eslint/camelcase */
export type EvaluationMessage = {
  text: string;
  file?: string;
  id: number;
  seen: boolean;
  user: User;
  createdAt: string;
  evaluationId: number;
};

export type RawEvaluationMessage = {
  text: string;
  file_url?: string;
  id: number;
  view: number;
  user: RawUser;
  created_at: string;
  evaluation_id: number;
};

export const EvaluationMessage = {
  fromRaw: ({
    text,
    file_url,
    id,
    view,
    user,
    created_at,
    evaluation_id,
  }: RawEvaluationMessage): EvaluationMessage => ({
    text,
    id,
    file: file_url,
    seen: !!view,
    user: fromRawUser(user),
    createdAt: moment(created_at).format('D MMM'),
    evaluationId: evaluation_id,
  }),
};
