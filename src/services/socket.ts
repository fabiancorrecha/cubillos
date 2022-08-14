import {SOCKET_URL} from 'react-native-dotenv';
import io from 'socket.io-client';

export const socket = io(SOCKET_URL, {
  secure: true,
});

const attemptToReconnect = (): void => {
  socket.connect();
  setTimeout(() => {
    if (socket.connected) {
      return;
    }

    attemptToReconnect();
  }, 500);
};

socket.on('disconnect', (reason: string) => {
  console.log(`Socket: disconnected: ${reason}`);
  attemptToReconnect();
});

socket.on('connect', () => {
  console.log('Socket: connected');
});
