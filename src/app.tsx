import React, {FunctionComponent} from 'react';
import 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {AdminStack} from 'screens/admin';
import {AppStack} from 'screens/app';
import {AuthStack} from 'screens/auth';
import {AuthLoading} from 'screens/auth-loading';
import {Logout} from 'screens/logout';
import {persistor, store} from 'store';
import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    full: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff'
    }
});

const RootStack = createSwitchNavigator(
  {
    AuthLoading,
    Logout,
    Auth: AuthStack,
    App: AppStack,
    Admin: AdminStack,
  },
  {
    initialRouteName: 'AuthLoading',
  },
);

const AppContainer = createAppContainer(RootStack);

export const App: FunctionComponent = () => {
  SplashScreen.hide();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      {
        Platform.OS == 'ios' ? (
          <KeyboardAvoidingView behavior="padding" style={ styles.full } enabled>
            <AppContainer />
          </KeyboardAvoidingView>
        ) : (
          <AppContainer />
        )      
      }
      </PersistGate>
    </Provider>
  )
};
