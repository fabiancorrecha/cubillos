/* eslint-disable @typescript-eslint/camelcase */

import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {on} from 'jetemit';
import {Appointment} from 'models/appointment';
import {Prescription} from 'models/prescription';
import moment from 'moment';
import React, {ReactElement, ReactNode, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import AppointmentsService from 'services/admin/appointments';
import {trace} from 'utils';
import Colors from 'utils/colors';
import {
  DateTimePicker,
  Header,
  OptionsMenu,
  Picker,
  Text,
  TextInput,
} from 'widgets';
import Button from 'widgets/button';

const STATUS_NONE = -1;
const STATUS_PENDING = 0;
const STATUS_CONFIRMED = 1;
const STATUS_DONE = 2;
const STATUS_CANCELED = 3;
const STATUS_EXPIRED = 4; // El estatus 4 no viene de la base de datos, se usa para filtrar las citas vencidas

type Status =
  | typeof STATUS_NONE
  | typeof STATUS_PENDING
  | typeof STATUS_CONFIRMED
  | typeof STATUS_DONE
  | typeof STATUS_CANCELED
  | typeof STATUS_EXPIRED

const STATUSES = {
  [STATUS_NONE]: 'Estatus',
  [STATUS_PENDING]: 'Pendiente',
  [STATUS_CONFIRMED]: 'Confirmado',
  [STATUS_DONE]: 'Finalizado',
  [STATUS_CANCELED]: 'Cancelado',
  [STATUS_EXPIRED]: 'Caducada',
};

const DATE_TIME_PICKER_HEIGHT = 72;

const styles = StyleSheet.create({
  activityIndicator: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  buttonTitle: {
    color: 'white',
  },
  list: {
    padding: 16,
  },
  listSeparator: {
    height: 16,
  },

  itemContainer: {
    borderRadius: 8,
    backgroundColor: Colors.gray,
    alignItems: 'center',

    // Sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  itemText: {
    color: Colors.blue,
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  filterButton: {
    alignSelf: 'center',
    backgroundColor: Colors.blue,
    borderRadius: 5,
    padding: 4,
    marginTop: -10,
    width: 100,
  },
  filterButtonText: {
    color: Colors.white,
    textAlign: 'center'
  },
});

// ITEM

type ItemProps = {
  item: Appointment;
  getStatus: (date: string,status: string) => string,
  onPress: () => void;
  onPressCancel: () => void;
  onPressConfirm: () => void;
};

const Item = ({
  item: {date, user, status},
  getStatus,
  onPress,
  onPressCancel,
  onPressConfirm,
}: ItemProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = (): void => setIsExpanded(prevIsExpanded => !prevIsExpanded);

  const humanReadableStatus = ((): string => {
    switch (status) {
      case 'canceled':
        return 'Cancelada';

      case 'confirmed':
        return 'Confirmada';

      case 'done':
        return 'Finalizado';

      case 'pending':
        return 'Pendiente';
    }
  })();

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <OptionsMenu
          options={[
            {
              label: 'Confirmar',
              action: onPressConfirm,
            },
            {
              label: 'Cancelar',
              action: onPressCancel,
            },
          ]}>
          <View style={{alignItems: 'center', flexDirection: 'row'}}>
            <Image
              source={Icons.options}
              style={{
                width: 16,
                height: 16,
                marginVertical: 12,
                marginStart: 12,
                marginEnd: 6,
              }}
            />
            <View
              style={{
                backgroundColor: Colors.gray2,
                height: 20,
                width: 1,
                marginEnd: 12,
              }}
            />
          </View>
        </OptionsMenu>
        <Text style={styles.itemText} bold>
          {moment(date, 'YYYY-MM-DD HH:mm:ss').format(
            'D [de] MMM [de] YYYY, H:mm',
          )}
        </Text>
        <TouchableOpacity onPress={toggle}>
          <Image
            source={Icons.dropDown}
            style={{height: 16, width: 16, margin: 16}}
          />
        </TouchableOpacity>
      </View>
      {isExpanded && (
        <View style={{width: '100%', paddingHorizontal: 16, paddingBottom: 16}}>
          <View
            style={{
              backgroundColor: Colors.gray2,
              height: 1,
              width: '100%',
              marginBottom: 8,
            }}
          />
          <View style={{marginTop: 8}}>
            <Text>
              <Text bold>Paciente:</Text> {user.person.name}{' '}
              {user.person.lastName}
            </Text>
            <Text>
              <Text bold>Estado:</Text> { getStatus(date,humanReadableStatus) }
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

// LIST

const initialState = {
  isLoading: true,
  isLoadingMore: false,
  data: [] as Appointment[],
  currentPage: 1,
  lastPage: 1,
  since: undefined as Date | undefined,
  until: undefined as Date | undefined,
  search: '',
  status: STATUS_NONE as Status,
  current_date: moment().format('YYYY-MM-DD HH:mm')
};

type State = typeof initialState;

type Props = {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
};

class Appointments extends React.Component<Props, State> {
  state = initialState;
  unsubscribeFromPrescriptionDeleted = null as null | (() => void);
  unsubscribeFromPrescriptionsUpdated = null as null | (() => void);

  componentDidMount(): void {
    this.load();

    this.unsubscribeFromPrescriptionDeleted = on(
      'PRESCRIPTION_DELETED',
      (prescriptionId: number) => {
        this.setState(prevState => ({
          data: prevState.data.map(it => ({
            ...it,
            prescriptions: it.prescriptions.filter(
              ({id}) => id !== prescriptionId,
            ),
          })),
        }));
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
        this.setState(prevState => ({
          data: prevState.data.map(it => ({
            ...it,
            prescriptions:
              it.id === appointmentId ? prescriptions : it.prescriptions,
          })),
        }));
      },
    );
  }

  componentWillUnmount() {
    this.unsubscribeFromPrescriptionDeleted?.();
    this.unsubscribeFromPrescriptionsUpdated?.();
  }

  load = (): void => {
    this.setState({isLoading: true, currentPage: 1}, () => {
      const {currentPage, since, until, search, status} = this.state;

      AppointmentsService.get({
        page: currentPage,
        since,
        until,
        search,
        status,
      })
        .then(({appointments: {last_page, data}, current_date}) => {
          this.setState({
            lastPage: last_page,
            data: data.map(Appointment.fromRaw),
            isLoading: false,
            current_date
          });
        })
        .catch((err: AxiosError) => {
          console.log('Appointments: load: ', err);
          this.setState({isLoading: false});
        });
    });
  };

  loadMore = (): void => {
    const {currentPage, since, until, search, status} = this.state;

    this.setState({isLoadingMore: true});

    AppointmentsService.get({
      page: currentPage + 1,
      since,
      until,
      search,
      status,
    })
      .then(({appointments: {data}}) => {
        this.setState(prevState => ({
          currentPage: prevState.currentPage + 1,
          data: [...prevState.data, ...data.map(Appointment.fromRaw)],
          isLoadingMore: false,
        }));
      })
      .catch((err: AxiosError) => {
        console.log('Appointments: load: ', err);
        this.setState({isLoadingMore: false});
      });
  };

  open = (appointment: Appointment) => (): void => {
    const {navigation} = this.props;

    navigation.navigate('AppointmentDetails', {appointment});
  };

  confirm = (id: number) => (): void => {
    this.setState({isLoading: true});
    AppointmentsService.changeStatus({id, status: STATUS_CONFIRMED})
      .then(() => {
        this.setState(prevState => ({
          data: prevState.data.map(appointment =>
            appointment.id === id
              ? {...appointment, status: 'confirmed'}
              : appointment,
          ),
        }));
      })
      .catch(trace('Appointments: confirm: '))
      .finally(() => {
        this.setState({isLoading: false});
      });
  };

  cancel = (id: number) => (): void => {
    this.setState({isLoading: true});
    AppointmentsService.changeStatus({id, status: STATUS_CANCELED})
      .then(() => {
        this.setState(prevState => ({
          data: prevState.data.map(appointment =>
            appointment.id === id
              ? {...appointment, status: 'canceled'}
              : appointment,
          ),
        }));
      })
      .catch(trace('Appointments: cancel: '))
      .finally(() => {
        this.setState({isLoading: false});
      });
  };

  isTimedOut = (date: string, status: string) => {
    return moment(date) < moment(this.state.current_date) && STATUSES[STATUS_PENDING] == status;
  }

  getStatus = (date: string, defaultStatus: string) => {
    if (this.isTimedOut(date,defaultStatus)) {
      return "Caducada";
    }
    else {
      return defaultStatus;
    }
  }

  render(): ReactNode {
    const {navigation} = this.props;
    const {data, isLoading, since, until, search, status} = this.state;

    return (
      <SafeAreaView style={ { flex: 1 } }>
        <Header
          backIcon={ Icons.home }
          title="Consulta presencial"
          icon={Icons.menu.appointments}
          navigation={navigation}
        />
        <View style={{flexDirection: 'row'}}>
          <TextInput
            containerStyle={{flex: 1, paddingHorizontal: 16}}
            value={search}
            onChangeText={newSearch => this.setState({search: newSearch})}
            placeholder="Buscar"
          />
          <Picker
            containerStyle={{flex: 1, paddingEnd: 16}}
            displayValue={STATUSES[status]}
            onValueChange={(newStatus: Status) => {
              this.setState({status: newStatus});
            }}
            selectedValue={status}>
            {Object.entries(STATUSES)
              .map(([value, label]): [number, string] => [
                parseInt(value),
                label,
              ])
              .sort(([a], [b]) => a - b)
              .map(([value, label]) => (
                <Picker.Item key={value} label={label} value={value} />
              ))}
          </Picker>
        </View>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: .5,
              height: DATE_TIME_PICKER_HEIGHT,
              paddingStart: 16,
              paddingRight: 8,
              paddingBottom: 8,
            }}>
            <DateTimePicker
              datePickerButton={ {
                flex: undefined,
                justifyContent: undefined,
                height: 40
              } }
              datePickerButtonText={ {
                textAlign: 'left',
                fontSize: 12,
                paddingLeft: 15,
                color: '#000'
              } }
              placeholder="Desde"
              value={since}
              onChange={(_, newSince) => {
                if (!newSince) {
                  return;
                }

                this.setState({since: newSince});
              }}
            />
          </View>
          <View
            style={{
              flex: .5,
              height: DATE_TIME_PICKER_HEIGHT,
              paddingStart: 8,
              paddingRight: 16,
              paddingBottom: 8,
            }}>
            <DateTimePicker
              datePickerButton={ {
                flex: undefined,
                justifyContent: undefined,
                height: 40
              } }
              datePickerButtonText={ {
                textAlign: 'left',
                fontSize: 12,
                paddingLeft: 15,
                color: '#000'
              } }
              placeholder="Hasta"
              value={until}
              onChange={(_, newUntil) => {
                if (!newUntil) {
                  return;
                }

                this.setState({until: newUntil});
              }}
            />
          </View>
        </View>
        <TouchableOpacity onPress={this.load}>
          <View style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </View>
        </TouchableOpacity>
        <FlatList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={this.extractKey}
          refreshControl={
            <RefreshControl refreshing={isLoading} enabled={false} />
          }
          renderItem={this.renderItem}
          ItemSeparatorComponent={this.renderItemSeparator}
          ListFooterComponent={this.renderFooter}
        />
      </SafeAreaView>
    );
  }

  renderItem = ({item}: ListRenderItemInfo<Appointment>): ReactElement => {
    return (
      <Item
        {...{item}}
        getStatus={this.getStatus}
        onPressConfirm={this.confirm(item.id)}
        onPressCancel={this.cancel(item.id)}
        onPress={this.open(item)}
      />
    );
  };

  renderFooter = (): ReactElement | null => {
    const {isLoadingMore, lastPage, currentPage} = this.state;

    if (isLoadingMore) {
      return (
        <ActivityIndicator
          color={Colors.yellow}
          style={styles.activityIndicator}
        />
      );
    }

    if (lastPage > currentPage) {
      return (
        <Button
          onPress={this.loadMore}
          style={styles.button}
          textBold
          title="Cargar más"
          titleStyle={styles.buttonTitle}
        />
      );
    }

    return null;
  };

  renderItemSeparator = (): ReactElement => (
    <View style={styles.listSeparator} />
  );

  extractKey = ({id}: Appointment): string => id.toString();
}

export default Appointments;
