import {UserAction, UserState} from 'actions/user';
import {Reducer} from 'redux';
import {exhaustiveCheck} from 'utils';

export const user: Reducer<UserState, UserAction> = (state = null, action) => {
  switch (action.type) {
    case 'User/SET':
      return action.user;
    case 'User/REMOVE':
      return null;
    default:
      exhaustiveCheck(action);
      return state;
  }
};
