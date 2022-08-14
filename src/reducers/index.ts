import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {combineReducers} from 'redux';
import {appointments} from './appointments';
import {chatId} from './chat-id';
import {evaluationMessages} from './evaluation-messages';
import {messages} from './messages';
import {user} from './user';

export const rootReducer = combineReducers({
  user,
  evaluationMessages,
  messages,
  appointments,
  chatId,
});

export type RootState = ReturnType<typeof rootReducer>;

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
