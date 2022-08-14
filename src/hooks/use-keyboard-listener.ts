import {useEffect} from 'react';
import {Keyboard, KeyboardEventName} from 'react-native';

export const useKeyboardListener = (
  event: KeyboardEventName,
  listener: () => void,
): void => {
  useEffect(() => {
    const subscription = Keyboard.addListener(event, listener);

    return (): void => {
      subscription.remove();
    };
  });
};
