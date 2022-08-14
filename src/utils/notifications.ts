import {NativeModules, Platform} from 'react-native';
const {Notification} = NativeModules;

export class Notifications {
  static showWithPayload(
    title: string,
    message: string,
    payload: object,
  ): void {
    if (Platform.OS === 'android') {
      Notification.showWithPayload(title, message, payload);
    } else {
      // Not yet implemented.
    }
  }
}
