import {setUser} from 'actions/user';
import {Images} from 'assets';
import Facebook from 'assets/icons/facebook.png';
import Google from 'assets/icons/google.png';
import {AxiosError} from 'axios';
import React, {FunctionComponent, useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import {useNavigation} from 'react-navigation-hooks';
import {AuthService, FacebookAuthService, GoogleAuthService} from 'services';
import {useTypedDispatch} from 'store';
import {showAlert} from 'utils';
import Colors from 'utils/colors';
import {Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import {API_URL} from 'react-native-dotenv';

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 125,
    marginTop: 10,
    padding: 5,
    borderRadius: 30,
  },
  btnLogin: {
    borderColor: Colors.black,
    backgroundColor: Colors.black,
    borderWidth: 2,
  },
  btnRegister: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    borderWidth: 2,
  },
  btnText: {
    textAlign: 'center',
  },
  textWhite: {
    color: Colors.white,
  },
  remember: {
    color: 'black',
    marginVertical: 10,
  },
  top: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    resizeMode: 'cover',
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    resizeMode: 'contain',
    maxWidth: 400,
  },
  facebook: {
    width: 35,
    height: 35,
  },
  separator: {
    height: 2,
    backgroundColor: Colors.gray,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 5,
  },
  authOptions: {
    textAlign: 'center',
    marginTop: 20,
  },
  flex: {
    width: '50%',
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'center',
  },
  authContainer: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
    marginTop: -20,
    backgroundColor: Colors.white,
  },
  online: {
    backgroundColor: Colors.yellow,
    width: 200,
    borderRadius: 30,
    padding: 5,
    alignSelf: 'center',
    marginTop: -35,
    marginBottom: 20,
  },
  onlineText: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: 16,
  },
  white: {
    backgroundColor: Colors.white,
    minHeight: Dimensions.get('window').height,
  },
});

export const Login: FunctionComponent = () => {
  const dispatch = useTypedDispatch();
  const {navigate} = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);

  const focusPassword = useCallback(() => {
    passwordRef.current?.focus();
  }, [passwordRef]);

  const [disableLoginButtons, setDisableLoginButtons] = useState(false);

  const loginWithFacebook = async (): Promise<void> => {
    if (disableLoginButtons) {
      return;
    }
    setDisableLoginButtons(true);

    try {
      const facebookUser = await FacebookAuthService.login();

      try {
        const user = await AuthService.loginWithFacebook(
          facebookUser.email,
          facebookUser.id,
        );
        dispatch(setUser(user));
        if (user.level === 'admin' || user.level === 'super-admin') {
          navigate('Admin');
        } else {
          navigate('App');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('RegisterWithSocialNetwork', {
            firstName: facebookUser.first_name,
            lastName: facebookUser.last_name || '.',
            email: facebookUser.email,
            tokenType: 'facebook',
            token: facebookUser.id,
          });
        } else if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.error);
        } else {
          console.log('Auth: loginWithGoole: ', err);
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }

        setDisableLoginButtons(false);
      }
    } catch {
      setDisableLoginButtons(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (disableLoginButtons) {
      return;
    }
    setDisableLoginButtons(true);

    try {
      const {user: googleUserInfo} = await GoogleAuthService.login();

      try {
        const user = await AuthService.loginWithGoogle(
          googleUserInfo.email,
          googleUserInfo.id,
        );
        dispatch(setUser(user));
        if (user.level === 'admin' || user.level === 'super-admin') {
          navigate('Admin');
        } else {
          navigate('App');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          GoogleAuthService.logOut();

          navigate('RegisterWithSocialNetwork', {
            firstName:
              googleUserInfo.givenName === 'null'
                ? ''
                : googleUserInfo.givenName,
            lastName:
              googleUserInfo.familyName === 'null'
                ? '.'
                : googleUserInfo.familyName,
            email: googleUserInfo.email,
            tokenType: 'google',
            token: googleUserInfo.id,
          });
        } else if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.error);
        } else {
          console.log('Auth: loginWithGoole: ', err);
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }

        setDisableLoginButtons(false);
      }
    } catch {
      setDisableLoginButtons(false);
    }
  };

  const login = useCallback(() => {
    setLoading(true);

    AuthService.login(email, password)
      .then(user => {
        dispatch(setUser(user));
        if (user.level === 'admin' || user.level === 'super-admin') {
          navigate('Admin');
        } else {
          navigate('App');
        }
      })
      .catch((err: AxiosError<{error: string}>) => {
        setLoading(false);

        if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.error);
        } else {
          console.log('Auth: login: ', err);
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }
      });
  }, [dispatch, email, navigate, password]);

  const register = useCallback(() => {
    navigate('Register');
  }, [navigate]);

  const resetPassword = useCallback(() => {
    navigate('ResetPassword');
  }, [navigate]);

  return (
    <SafeAreaView>
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.white}>
          <ImageBackground style={styles.top} source={Images.loginBackground}>
            <Image style={styles.logo} source={Images.logo} />
          </ImageBackground>
          <View style={styles.authContainer}>
            <View style={styles.online}>
              <Text style={styles.onlineText} bold>
                Consultas Online
              </Text>
            </View>
            <TextInput
              editable={!loading}
              onChangeText={setEmail}
              onSubmitEditing={focusPassword}
              placeholder="Correo electrónico"
              value={email}
            />
            <TextInput
              editable={!loading}
              onChangeText={setPassword}
              onSubmitEditing={login}
              placeholder="Contraseña"
              ref={passwordRef}
              secureTextEntry
              value={password}
            />
            <TouchableOpacity onPress={resetPassword}>
              <View>
                <Text style={[styles.center, styles.remember]}>
                  ¿Olvidó su contraseña?
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.center}>
              {loading ? (
                <ActivityIndicator
                  style={{
                    marginVertical: 5,
                  }}
                />
              ) : (
                <Button
                  title="Entrar"
                  style={[styles.btn, styles.btnLogin]}
                  titleStyle={[styles.textWhite, styles.btnText]}
                  textBold
                  onPress={login}
                />
              )}
              <Button
                style={[styles.btn, styles.btnRegister]}
                title="Registrar"
                titleStyle={[styles.textWhite, styles.btnText]}
                textBold
                onPress={register}
              />
            </View>
            <Text style={styles.authOptions} bold>
              Inicia sesión con
            </Text>
            <View style={styles.separator} />
            <View style={styles.flex}>
              {/*<View style={{flex: 0.5, alignItems: 'center'}}>
                <TouchableOpacity onPress={loginWithFacebook}>
                  <Image source={Facebook} style={styles.facebook} />
                </TouchableOpacity>
              </View>*/}
              <View style={{flex: 1, alignItems: 'center'}}>
                <TouchableOpacity onPress={loginWithGoogle}>
                  <Image source={Google} style={styles.facebook} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
