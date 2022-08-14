import {Action} from 'redux';

export interface SetChatIdAction extends Action<'ChatId/SET'> {
  chatId: number;
}

export type RemoveChatIdAction = Action<'ChatId/REMOVE'>;

export type ChatIdAction = SetChatIdAction | RemoveChatIdAction;

export type ChatIdState = number | null;

export const setChatId = (chatId: number): ChatIdAction => ({
  type: 'ChatId/SET',
  chatId,
});

export const removeChatId = (): ChatIdAction => ({
  type: 'ChatId/REMOVE',
});
