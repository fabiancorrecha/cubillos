import {
  EvaluationMessagesAction,
  EvaluationMessagesState,
} from 'actions/evaluation-messages';
import {Reducer} from 'redux';
import {exhaustiveCheck} from 'utils';

export const evaluationMessages: Reducer<
  EvaluationMessagesState,
  EvaluationMessagesAction
> = (state: EvaluationMessagesState = {}, action) => {
  switch (action.type) {
    case 'EvaluationMessages/SET':
      return {...state, [action.evaluationId]: action.messages};
    case 'EvaluationMessages/ADD': {
      const newMessages = state[action.evaluationId] || [];
      return {
        ...state,
        [action.evaluationId]: [...newMessages, action.message],
      };
    }
    default:
      exhaustiveCheck(action);
      return state;
  }
};
