import {ChatIdAction, ChatIdState} from 'actions/chat-id';
import {Reducer} from 'redux';
import {exhaustiveCheck} from 'utils';

export const chatId: Reducer<ChatIdState, ChatIdAction> = (
  state = null,
  action,
) => {
  switch (action.type) {
    case 'ChatId/SET':
      return action.chatId;
    case 'ChatId/REMOVE':
      return null;
    default:
      exhaustiveCheck(action);
      return state;
  }
};
