import {AxiosError} from 'axios';
import React, {FunctionComponent, useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Toast from 'react-native-root-toast';
import {useNavigation} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {UsersService} from 'services';
import {prop} from 'utils';
import {useTypedDispatch} from 'store';
import {setUser, removeUser} from 'actions/user';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
});

export const AuthLoading: FunctionComponent = () => {
  const user = useTypedSelector(prop('user'));
  const dispatch = useTypedDispatch();
  const {navigate} = useNavigation();

  useEffect(() => {
    if (!user) {
      navigate('Login');
      return;
    }

    UsersService.show(user.id)
      .then(newUser => {
        if (!newUser.active) {
          dispatch(removeUser());
          Toast.show('Su usuario ha sido desactivado');
          navigate('Login');
          return;
        }

        dispatch(setUser(newUser));
        if (user.level === 'admin' || user.level === 'super-admin') {
          navigate('Admin');
        } else {
          navigate('App');
        }
      })
      .catch((err: AxiosError) => {
        if (err.response?.status === 404) {
          dispatch(removeUser());
          Toast.show('Su usuario ha sido eliminado');
          navigate('Login');
          return;
        }

        console.log('AuthLoading: useEffect:', err);
        if (user.level === 'admin' || user.level === 'super-admin') {
          navigate('Admin');
        } else {
          navigate('App');
        }
      });
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
};
