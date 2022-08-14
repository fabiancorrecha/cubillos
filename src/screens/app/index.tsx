import {useSocketEvent} from 'hooks';
import {User} from 'models/user';
import React, {ReactNode, useEffect} from 'react';
import {View} from 'react-native';
import Toast from 'react-native-root-toast';
import {
  NavigationActions,
  NavigationNavigator,
  NavigationNavigatorProps,
  NavigationState,
} from 'react-navigation';
import {
  createStackNavigator,
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from 'react-navigation-stack';
import {useTypedSelector} from 'reducers';
import {socket} from 'services/socket';
import {prop, Notifications} from 'utils';
import {
  Appointments,
  CreateAppointment,
  PayAppointmentWithPayco,
} from './appointments';
import {Chat} from './chat';
import {Dashboard} from './dashboard';
import {EvaluationHistory} from './evaluation-history';
import {Profile} from './profile';
import {RequestEvaluation} from './request-evaluation';
import {EvaluationSent} from './request-evaluation/evaluation-sent';
import {ViewEvaluation} from './view-evaluation';
import {ViewImage} from './view-image';
import {ViewImages} from './view-images';
import {ImageEditor} from 'screens/common/image-editor';

const Navigator = createStackNavigator(
  {
    Dashboard: {
      screen: Dashboard,
      navigationOptions: {headerShown: false},
    },
    Profile: {
      screen: Profile,
      navigationOptions: {headerShown: false},
    },
    RequestEvaluation: {
      screen: RequestEvaluation,
      navigationOptions: {headerShown: false},
    },
    EvaluationSent: {
      screen: EvaluationSent,
      navigationOptions: {headerShown: false},
    },
    EvaluationHistory: {
      screen: EvaluationHistory,
      navigationOptions: {headerShown: false},
    },
    ViewEvaluation: {
      screen: ViewEvaluation,
      navigationOptions: {headerShown: false},
    },
    ViewImages: {
      screen: ViewImages,
    },
    ViewImage: {
      screen: ViewImage,
      navigationOptions: {headerShown: false},
    },
    Appointments: {
      screen: Appointments,
      navigationOptions: {headerShown: false},
    },
    CreateAppointment: {
      screen: CreateAppointment,
    },
    PayAppointmentWithPayco: {
      // El tipado de createStackNavigator es incorrecto.
      //
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      screen: PayAppointmentWithPayco,
    },
    Chat,
    ImageEditor,
  },
  {
    initialRouteName: 'Dashboard',
    defaultNavigationOptions: {
      headerTruncatedBackTitle: '',
      headerBackTitle: '',
      headerStyle: {
        height: 104,
        elevation: 0, // Android
      },
      // eslint-disable-next-line react/display-name
      headerLeft: ({
        canGoBack,
        ...rest
      }: StackHeaderLeftButtonProps): ReactNode =>
        canGoBack ? (
          <View style={{height: '100%', paddingVertical: 8}}>
            <HeaderBackButton canGoBack={canGoBack} {...rest} />
          </View>
        ) : null,
      headerTitleAlign: 'center',
    },
  },
);

type NotificationsEvent = {
  users: {id: number}[];
  type: {name: string; description: string};
}[];

export const AppStack: NavigationNavigator<{}, NavigationState> = ({
  navigation,
}: NavigationNavigatorProps) => {
  const user = useTypedSelector(prop('user')) as User;

  useSocketEvent('notifications/send', (notifications: NotificationsEvent) => {
    notifications.forEach(n => {
      if (n.users.find(({id}) => id === user?.id)) {
        Notifications.showWithPayload(n.type.name, n.type.description, {});
      }
    });
  });

  useEffect(() => {
    const listener = (id: number): void => {
      if (user.id !== id) {
        return;
      }

      Toast.show('Su usuario ha sido eliminado');
      navigation?.dispatch(
        NavigationActions.navigate({
          routeName: 'Logout',
        }),
      );
    };

    socket.on('patients/user-delete', listener);

    return (): void => {
      socket.off('patients/user-delete', listener);
    };
  }, [navigation, user.id]);

  useEffect(() => {
    const listener = (id: number): void => {
      if (user.id !== id) {
        return;
      }

      Toast.show('Su usuario ha sido desactivado');
      navigation?.dispatch(
        NavigationActions.navigate({
          routeName: 'Logout',
        }),
      );
    };

    socket.on('patients/user-disable', listener);

    return (): void => {
      socket.off('patients/user-disable', listener);
    };
  }, [navigation, user.id]);

  return <Navigator navigation={navigation} />;
};

AppStack.router = Navigator.router;
