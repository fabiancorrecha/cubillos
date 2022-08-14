/* eslint-disable @typescript-eslint/camelcase */

import {Message, RawMessage} from 'models/message';
import {useEffect} from 'react';
import {axios} from './axios';
import {socket} from './socket';

export const MessagesService = {
  show: (userId: number): Promise<[number, Message[], boolean]> =>
    new Promise((resolve, reject) =>
      axios
        .get(`chat/${userId}`)
        .then(({data: {chat_id, messages, is_new}}) => {
          resolve([chat_id, messages.map(Message.fromRaw), is_new]);
        })
        .catch(reject),
    ),

  sawMessage: (messageId: number): Promise<void> =>
    axios.put(`chat/saw/${messageId}`),

  useSendMessageListener: (listener: (_: Message) => void): void => {
    useEffect(() => {
      const realListener = (message: RawMessage): void => {
        listener(Message.fromRaw(message));
      };

      socket.on('chat/message', realListener);
      return (): void => {
        socket.off('chat/message', realListener);
      };
    }, [listener]);
  },

  emitSendMessage: (message: object): void => {
    socket.emit('chat/message', message);
  },

  emitRefreshChatList: (): void => {
    socket.emit('chat/reload');
  },
};
