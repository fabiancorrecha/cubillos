import {Message} from 'models/message';
import {Action} from 'redux';

export interface SetMessagesAction extends Action<'Messages/SET'> {
  messages: Message[];
}

export interface AddMessageAction extends Action<'Messages/ADD'> {
  message: Message;
}

export type MessagesAction = SetMessagesAction | AddMessageAction;

export type MessagesState = Message[];

export const setMessages = (messages: Message[]): MessagesAction => ({
  type: 'Messages/SET',
  messages,
});

export const addMessage = (message: Message): MessagesAction => ({
  type: 'Messages/ADD',
  message,
});
