import {createStackNavigator} from 'react-navigation-stack';
import {ImageEditor} from 'screens/common/image-editor';
import {Login} from './login';
import {Register, RegisterWithSocialNetwork} from './register';
import {ResetPassword} from './reset-password';

export const AuthStack = createStackNavigator({
  Login: {
    screen: Login,
    navigationOptions: {
      headerShown: false,
    },
  },
  Register: {
    screen: Register,
    navigationOptions: {
      headerShown: false,
    },
  },
  RegisterWithSocialNetwork: {
    screen: RegisterWithSocialNetwork,
    navigationOptions: {
      headerShown: false,
    },
  },
  ResetPassword: {
    screen: ResetPassword,
    navigationOptions: {
      headerShown: false,
    },
  },
  ImageEditor,
});
