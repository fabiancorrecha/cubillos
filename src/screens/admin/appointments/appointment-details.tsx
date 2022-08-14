import {Icons} from 'assets';
import {on} from 'jetemit';
import {Appointment} from 'models/appointment';
import {Prescription} from 'models/prescription';
import moment from 'moment';
import React, {
  Component,
  ComponentType,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {NavigationStackProp} from 'react-navigation-stack';
import {UsersService} from 'services';
import {formatCurrency} from 'utils';
import Colors from 'utils/colors';
import {Header, Text} from 'widgets';
import Prescriptions from './prescriptions';
import Record from './record';
import { calculateAge } from 'utils/calculate-age';

// WHOLE PAGE STYLES

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  tabBar: {
    backgroundColor: '#272b2e',
    flexDirection: 'row',
    width: '100%',
  },
  tabTextContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabText: {
    color: Colors.gray2,
    textAlign: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
  },
  tabSelected: {
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    backgroundColor: 'white',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabTextSelected: {
    color: Colors.blue,
  },
  tabContent: {
    flex: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContainer: {
    padding: 16,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  rowLabel: {
    flex: 4,
  },
  rowContent: {
    flex: 6,
  },
  rowSeparator: {
    height: 8,
  },
  sectionHeaderContainer: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 2,
    flexDirection: 'row',
    paddingVertical: 4,
  },
  sectionHeaderTitle: {
    color: Colors.blue,
  },
});

// DETAILS PAGE

type RowProps = {
  label: string;
  content: string;
};

const Row = ({label, content}: RowProps): ReactElement => (
  <View style={styles.rowContainer}>
    <View style={styles.rowLabel}>
      <Text bold numberOfLines={1}>
        {label}:
      </Text>
    </View>
    <View style={styles.rowContent}>
      <Text numberOfLines={1}>{content}</Text>
    </View>
  </View>
);

type SectionHeaderProps = {label: string};

const SectionHeader = ({label}: SectionHeaderProps): ReactElement => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionHeaderTitle} bold>
      {label}
    </Text>
  </View>
);

const RowSeparator = (): ReactElement => <View style={styles.rowSeparator} />;

const Details = ({appointment: {user, payment}}: TabProps): ReactElement => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    UsersService.getData(user.id)
      .then(data => {
        setLoading(false);
        setData(data);
      })
      .catch(err => {
        console.log('AppointmentDetails: Details: useEffect:', err);
        setLoading(false);
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.detailsContainer}>
      <SectionHeader label="Datos del paciente" />
      <RowSeparator />
      <Row
        label="Nombre"
        content={`${user.person.name} ${user.person.lastName}`}
      />
      <RowSeparator />
      <Row label="Correo electrónico" content={user.email} />
      <RowSeparator />
      <Row label="Teléfono" content={user.person.phoneNumber} />
      <RowSeparator />
      <Row label="País" content={user.person.country.name} />
      <RowSeparator />
      <Row label="Dirección" content={user.person.address} />
      {payment && (
        <>
          <RowSeparator />
          <RowSeparator />
          <SectionHeader label="Datos de pago" />
          <RowSeparator />
          <Row label="Monto" content={formatCurrency('$', payment.amount)} />
          <RowSeparator />
          <Row
            label="Método de pago"
            content={payment.method === 'paypal' ? 'PayPal' : 'ePayco'}
          />
          <RowSeparator />
          <Row label="Fecha" content={moment(payment.date).format('LLL')} />
          <RowSeparator />
          <Row label="Código" content={payment.responseCode} />
        </>
      )}
      {loading && (
        <ActivityIndicator style={{padding: 16}} color={Colors.yellow} />
      )}
      {!!data && Object.values(data).some(value => !!value) && (
        <>
          <RowSeparator />
          <RowSeparator />
          <SectionHeader label="Datos adicionales" />
          {!!data.previous_procedures && (
            <>
              <RowSeparator />
              <Row label="Previas operaciones" content={data.previous_procedures} />
            </>
          )}
          {!!data.diseases && (
            <>
              <RowSeparator />
              <Row label="Enfermedades" content={data.diseases} />
            </>
          )}
          {!!data.medicines && (
            <>
              <RowSeparator />
              <Row label="Medicamentos" content={data.medicines} />
            </>
          )}
          {!!data.allergies && (
            <>
              <RowSeparator />
              <Row label="Alergias" content={data.allergies} />
            </>
          )}
          {!!data.birthdate && (
            <>
              <RowSeparator />
              <Row label="Nacimiento" content={data.birthdate} />
              <RowSeparator />
              <Row label="Edad" content={String(calculateAge(data.birthdate))} />
            </>
          )}
          {!!data.gender && (
            <>
              <RowSeparator />
              <Row label="Género" content={data.gender} />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

// ACTUAL PAGE

type Props = {
  navigation: NavigationStackProp;
};

type TabProps = {
  appointment: Appointment;
  navigation: NavigationStackProp;
};

type Tab = {
  label: string;
  Component: ComponentType<TabProps>;
};

const TABS: Tab[] = [
  {label: 'Detalles', Component: Details},
  {label: 'Historial', Component: Record},
  {label: 'Recetas', Component: Prescriptions},
];

const initialState = {
  selectedTabIndex: 0,
};

type State = typeof initialState;

type UnsubscribeFunc = null | Function;

class AppointmentDetails extends Component<Props, State> {
  state = initialState;
  unsubscribeFromPrescriptionDeleted: UnsubscribeFunc = null;
  unsubscribeFromPrescriptionsUpdated: UnsubscribeFunc = null;

  componentDidMount(): void {
    this.unsubscribeFromPrescriptionDeleted = on(
      'PRESCRIPTION_DELETED',
      (prescriptionId: number) => {
        const {navigation} = this.props;
        const appointment = navigation.getParam('appointment') as Appointment;

        const newPrescriptions = appointment.prescriptions.filter(
          ({id}) => id !== prescriptionId,
        );

        navigation.setParams({
          appointment: {...appointment, prescriptions: newPrescriptions},
        });
      },
    );

    this.unsubscribeFromPrescriptionsUpdated = on(
      'PRESCRIPTIONS_UPDATED',
      ({
        appointmentId,
        prescriptions,
      }: {
        appointmentId: number;
        prescriptions: Prescription[];
      }) => {
        const {navigation} = this.props;
        const appointment = navigation.getParam('appointment') as Appointment;

        navigation.setParams({
          appointment: {
            ...appointment,
            prescriptions:
              appointmentId === appointment.id
                ? prescriptions
                : appointment.prescriptions,
          },
        });
      },
    );
  }

  componentWillUnmount(): void {
    this.unsubscribeFromPrescriptionDeleted?.();
    this.unsubscribeFromPrescriptionsUpdated?.();
  }

  setSelectedTabIndex = (selectedTabIndex: number) => (): void =>
    this.setState({selectedTabIndex});

  render(): ReactNode {
    const {navigation} = this.props;
    const {selectedTabIndex} = this.state;
    const appointment = navigation.getParam('appointment');

    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <Header
            title="Detalles de la cita"
            icon={Icons.menu.appointments}
            navigation={navigation}
          />
          <View style={styles.tabBar}>
            {TABS.map(({label}, index) => {
              const isSelected = index === selectedTabIndex;
              return (
                <View
                  key={index}
                  style={[styles.tab, isSelected ? styles.tabSelected : null]}>
                  <TouchableOpacity onPress={this.setSelectedTabIndex(index)}>
                    <View style={styles.tabTextContainer}>
                      <Text
                        bold
                        style={[
                          styles.tabText,
                          isSelected ? styles.tabTextSelected : null,
                        ]}>
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <View style={styles.tabContent}>
            {((): ReactElement => {
              const {Component} = TABS[selectedTabIndex];
              return <Component {...{appointment, navigation}} />;
            })()}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default AppointmentDetails;
