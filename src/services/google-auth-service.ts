import {GoogleSignin, User} from '@react-native-community/google-signin';

GoogleSignin.configure({
	iosClientId: '339396272915-rlphetucpjt15cepj51v2a2ciouhr9ig.apps.googleusercontent.com',
	forceConsentPrompt: true
});

export class GoogleAuthService {
  static async login(): Promise<User> {
    await GoogleSignin.hasPlayServices();
    return await GoogleSignin.signIn();
  }

  static async logOut(): Promise<void> {
    await GoogleSignin.signOut();
  }
}
