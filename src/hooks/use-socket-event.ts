import {useEffect} from 'react';
import {socket} from 'services/socket';

export const useSocketEvent = <T>(
  event: string,
  listener: (data: T) => void,
): void => {
  useEffect(() => {
    const realListener = (data: T): void => {
      console.log(`useSocketEvent: ${event}: `, {data});
      listener(data);
    };

    socket.on(event, realListener);
    return (): void => {
      socket.off(event, realListener);
    };
  }, [event, listener]);
};
