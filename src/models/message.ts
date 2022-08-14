/* eslint-disable @typescript-eslint/camelcase */
import {User, fromRawUser, RawUser} from './user';
import moment from 'moment';

export type Message = {
  id: number;
  user: User;
  chatId: number;
  text: string;
  seen: boolean;
  date: Date;
};

export type RawMessage = {
  id: number;
  user: RawUser;
  chat_id: number;
  text: string;
  view: number;
  created_at: string;
};

export const Message = {
  fromRaw: ({
    text,
    id,
    view,
    user,
    created_at,
    chat_id,
  }: RawMessage): Message => ({
    text,
    user: fromRawUser(user),
    id,
    chatId: chat_id,
    seen: !!view,
    date: moment(created_at).toDate(),
  }),
};
