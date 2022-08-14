import React, { ReactNode } from 'react';
import { View } from 'react-native';
import {
  NavigationNavigator,
  NavigationNavigatorProps,
  NavigationState,
} from 'react-navigation';
import {
  createStackNavigator,
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from 'react-navigation-stack';

import { Dashboard } from './dashboard';
import { Profile } from './profile';
import Appointments from './appointments/appointments';
import AppointmentDetails from './appointments/appointment-details';
import Schedule from './schedule/schedule';
import Evaluations from './evaluations/evaluations';
import Procedures from './procedures/procedures';
import Prices from './prices/prices';
import Moderators from './moderators/moderators';
import Patients from './patients/patients';
import Chat from './chat/chat';
import { ViewEvaluation } from './evaluations/view-evaluation';
import { ViewImage } from './evaluations/view-image';
import { ViewImages } from './evaluations/view-images';
import { ViewChat } from './chat/view-chat';
import { RecordForm } from './appointments/record-form';
import { PrescriptionForm } from './appointments/prescription-form';
import CreateEditProcedure from './procedures/create-edit-procedure';
import CreateEditModerator from './moderators/create-edit-moderator';
import ChangePassword from './moderators/change-password';
import ChangePasswordPatient from './patients/change-password';
import CreateEditPatient from './patients/create-edit-patient';
import PatientRecord from './patients/patient-record';
import ViewPatient from './patients/view-patient';

const Navigator = createStackNavigator(
  {
    Dashboard: {
      screen: Dashboard,
      navigationOptions: {
        headerShown: false
      }
    },
    Profile: {
      screen: Profile,
      navigationOptions: {
        headerShown: false
      }
    },
    Appointments: {
      screen: Appointments,
      navigationOptions: {
        headerShown: false
      }
    },
    AppointmentDetails: {
      screen: AppointmentDetails,
      navigationOptions: {
        headerShown: false
      }
    },
    RecordForm: {
      screen: RecordForm,
      navigationOptions: {
        headerShown: false
      }
    },
    PrescriptionForm: {
      screen: PrescriptionForm,
      navigationOptions: {
        headerShown: false
      }
    },
    Evaluations: {
      screen: Evaluations,
      navigationOptions: {
        headerShown: false
      }
    },
    ViewEvaluation: {
      screen: ViewEvaluation,
      navigationOptions: {
        headerShown: false
      }
    },
    Chat: {
      screen: Chat,
      navigationOptions: {
        headerShown: false
      }
    },
    Procedures: {
      screen: Procedures,
      navigationOptions: {
        headerShown: false
      }
    },
    Patients: {
      screen: Patients,
      navigationOptions: {
        headerShown: false
      }
    },
    PatientRecord: {
      screen: PatientRecord,
      navigationOptions: {
        headerShown: false
      }
    },
    Schedule: {
      screen: Schedule,
      navigationOptions: {
        headerShown: false
      }
    },
    Moderators: {
      screen: Moderators,
      navigationOptions: {
        headerShown: false
      }
    },
    Prices: {
      screen: Prices,
      navigationOptions: {
        headerShown: false
      }
    },
    ViewImage: {
      screen: ViewImage,
      navigationOptions: {
        headerShown: false
      }
    },
    ViewImages: {
      screen: ViewImages,
      navigationOptions: {
        headerShown: false
      }
    },
    ViewChat: {
      screen: ViewChat,
      navigationOptions: {
        headerShown: false
      }
    },
    CreateEditProcedure: {
      screen: CreateEditProcedure,
      navigationOptions: {
        headerShown: false
      }
    },
    CreateEditModerator: {
      screen: CreateEditModerator,
      navigationOptions: {
        headerShown: false
      }
    },
    ChangePassword: {
      screen: ChangePassword,
      navigationOptions: {
        headerShown: false
      }
    },
    ChangePasswordPatient: {
      screen: ChangePasswordPatient,
      navigationOptions: {
        headerShown: false
      }
    },
    CreateEditPatient: {
      screen: CreateEditPatient,
      navigationOptions: {
        headerShown: false
      }
    },
    ViewPatient: {
      screen: ViewPatient,
      navigationOptions: {
        headerShown: false
      }
    }
  },
  {
    initialRouteName: 'Dashboard',
    defaultNavigationOptions: {
      headerTruncatedBackTitle: '',
      headerBackTitle: '',
      headerStyle: {
        height: 104,
        elevation: 0,
      },
      headerLeft: ({
        canGoBack,
        ...rest
      }: StackHeaderLeftButtonProps): ReactNode =>
        canGoBack ? (
          <View style={ { height: '100%', paddingVertical: 8 } }>
            <HeaderBackButton canGoBack={ canGoBack } { ...rest } />
          </View>
        ) : null,
      headerTitleAlign: 'center',
    },
  },
);

export const AdminStack: NavigationNavigator<{}, NavigationState> = ({
  navigation,
}: NavigationNavigatorProps) => <Navigator navigation={ navigation } />

AdminStack.router = Navigator.router;
