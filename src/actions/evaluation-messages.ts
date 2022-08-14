import {EvaluationMessage} from 'models/evaluation-message';
import {Action} from 'redux';

export interface SetEvaluationMessagesAction
  extends Action<'EvaluationMessages/SET'> {
  evaluationId: number;
  messages: EvaluationMessage[];
}

export interface AddEvaluationMessageAction
  extends Action<'EvaluationMessages/ADD'> {
  evaluationId: number;
  message: EvaluationMessage;
}

export type EvaluationMessagesAction =
  | SetEvaluationMessagesAction
  | AddEvaluationMessageAction;

export type EvaluationMessagesState = {[key: number]: EvaluationMessage[]};

export const setMessages = (
  evaluationId: number,
  messages: EvaluationMessage[],
): EvaluationMessagesAction => ({
  type: 'EvaluationMessages/SET',
  evaluationId,
  messages,
});

export const addMessage = (
  evaluationId: number,
  message: EvaluationMessage,
): EvaluationMessagesAction => ({
  type: 'EvaluationMessages/ADD',
  evaluationId,
  message,
});
