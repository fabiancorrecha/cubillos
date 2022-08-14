import {MessagesAction, MessagesState} from 'actions/messages';
import {Reducer} from 'redux';
import {exhaustiveCheck} from 'utils';

export const messages: Reducer<MessagesState, MessagesAction> = (
  state: MessagesState = [],
  action,
) => {
  switch (action.type) {
    case 'Messages/SET':
      return action.messages;
    case 'Messages/ADD':
      return [...state, action.message];
    default:
      exhaustiveCheck(action);
      return state;
  }
};
