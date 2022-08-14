import {User} from 'models/user';
import {Action} from 'redux';

export interface SetUserAction extends Action<'User/SET'> {
  user: User;
}
export type RemoveUserAction = Action<'User/REMOVE'>;
export type UserAction = SetUserAction | RemoveUserAction;
export type UserState = User | null;

export const setUser = (user: User): UserAction => ({
  type: 'User/SET',
  user,
});

export const removeUser = (): UserAction => ({
  type: 'User/REMOVE',
});
