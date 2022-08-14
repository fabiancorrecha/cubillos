import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import {Platform} from 'react-native';

const LOGIN_BEHAVIOR = Platform.OS === 'ios' ? 'browser' : 'web_only';
LoginManager.setLoginBehavior(LOGIN_BEHAVIOR);

export class FacebookAuthService {
  static async login(): Promise<{[key: string]: string}> {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.error) {
      throw result.error;
    }

    if (result.isCancelled) {
      throw 'Login canceled';
    }

    const accessToken = await AccessToken.getCurrentAccessToken();
    if (accessToken === null) {
      throw 'Couldn\'t get current access token';
    }

    return await this.requestInfo(accessToken.accessToken);
  }

  static logOut(): void {
    LoginManager.logOut();
  }

  static requestInfo(accessToken: string): Promise<{[key: string]: string}> {
    return new Promise((resolve, reject) => {
      new GraphRequestManager()
        .addRequest(
          new GraphRequest(
            '/me',
            {
              accessToken: accessToken,
              parameters: {
                fields: {
                  string: 'email,first_name,last_name',
                },
              },
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result as {[key: string]: string});
              }
            },
          ),
        )
        .start();
    });
  }
}
