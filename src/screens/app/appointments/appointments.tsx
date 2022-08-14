import {
  cancelAppointment,
  confirmAppointment,
  finishAppointment,
  setAppointments,
} from 'actions/appointments';
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Appointment} from 'models/appointment';
import {User} from 'models/user';
import moment from 'moment';
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {useFocusEffect, useNavigation} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {AppointmentsService} from 'services/appointments-service';
import {useTypedDispatch} from 'store';
import {prop} from 'utils';
import Colors from 'utils/colors';
import {Header, OptionsMenu, Text} from 'widgets';
import Button from 'widgets/button';
import {socket} from 'services/socket';

const styles = StyleSheet.create({
  list: {
    paddingBottom: 88,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    fontSize: 11,
    paddingVertical: 16,
    paddingRight: 16,
  },

  itemCheckContainer: {
    padding: 12,
  },

  itemCheck: {
    height: 24,
    resizeMode: 'contain',
    width: 24,
  },

  addButton: {
    // Alinear el botón en la parte inferior.
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{translateX: -56 / 2}],

    // Alinear el icono en el centro.
    alignItems: 'center',
    justifyContent: 'center',

    // Tamaño y color.
    height: 56,
    width: 56,
    backgroundColor: Colors.yellow,
    borderRadius: 100,

    // Sombra.
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  button: {
    borderRadius: 100,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  confirmButton: {
    backgroundColor: Colors.yellow,
  },

  confirmButtonTitle: {
    color: 'white',
  },

  cancelButton: {
    backgroundColor: Colors.black,
  },

  cancelButtonTitle: {
    color: 'white',
  },
});

type ItemProps = {
  appointment: Appointment;
  onPressConfirm: (appointmentId: number) => void;
  onPressCancel: (appointmentId: number) => void;
};

const SECONDS_IN_A_DAY = 86400;

export const Item = ({
  appointment: {id, date, status, description},
  onPressConfirm,
  onPressCancel,
}: ItemProps): ReactElement => {
  // TODO: Refactorizar.

  const diff = moment(date).diff(moment(), 'seconds');
  const [expanded, setExpanded] = useState(false);
  const toggle = (): void => setExpanded(oldExpanded => !oldExpanded);

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={toggle}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {((): ReactNode => {
          switch (status) {
            case 'pending':
              return (
                <OptionsMenu
                  options={[
                    {
                      label: 'Cancelar',
                      action: (): void => onPressCancel(id),
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
                        tintColor: Colors.yellow,
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
              );

            case 'confirmed':
              return (
                <View style={{alignItems: 'center', flexDirection: 'row'}}>
                  <Image
                    source={Icons.appointmentConfirmed}
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
              );

            default:
              return (
                <View style={{alignItems: 'center', flexDirection: 'row'}}>
                  <Image
                    source={Icons.evaluationCheck}
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
              );
          }
        })()}
        <Text style={styles.itemText} bold>
          {moment(date, 'YYYY-MM-DD HH:mm:ss').format(
            'D [de] MMM [de] YYYY, H:mm',
          )}
        </Text>
        <TouchableOpacity
          style={{transform: [{rotate: expanded ? '180deg' : '0deg'}]}}
          onPress={toggle}>
          <Image
            source={Icons.dropDown}
            style={{height: 16, width: 16, marginHorizontal: 16}}
          />
        </TouchableOpacity>
      </View>
      {expanded && (
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
            <Text>{description}</Text>
          </View>
        </View>
      )}
      {diff > 0 && diff < SECONDS_IN_A_DAY && status === 'pending' && (
        <View
          style={{width: '100%', alignItems: 'center', paddingHorizontal: 16}}>
          <View
            style={{
              backgroundColor: Colors.gray2,
              height: 1,
              width: '100%',
              marginBottom: 8,
            }}
          />
          <Text>¿Asistirá a su cita?</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
            <Button
              textBold
              onPress={(): void => onPressConfirm(id)}
              style={[styles.button, styles.confirmButton]}
              title="Confirmar"
              titleStyle={styles.confirmButtonTitle}
            />
            <Button
              textBold
              onPress={(): void => onPressCancel(id)}
              style={[styles.button, styles.cancelButton]}
              title="Cancelar"
              titleStyle={styles.cancelButtonTitle}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const extractItemKey = ({id}: Appointment): string => id.toString();

export const Appointments = (): ReactElement => {
  const navigation = useNavigation();
  const dispatch = useTypedDispatch();
  const user = useTypedSelector(prop('user')) as User;
  const appointments = useTypedSelector(prop('appointments'));
  const {navigate} = useNavigation();
  const listRef = useRef<FlatList>(null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(() => {
    setRefreshing(true);

    AppointmentsService.index(user.id)
      .then(newAppointments => dispatch(setAppointments(newAppointments)))
      .catch((err: AxiosError) => {
        console.log('Appointments: fetchAppointments:', err);
        Toast.show('Ha ocurrido un error al cargar sus citas');
      })
      .finally(() => setRefreshing(false));
  }, [dispatch, user.id]);

  useFocusEffect(fetchAppointments);

  const doConfirmAppointment = useCallback(
    (appointmentId: number) => {
      setRefreshing(true);
      AppointmentsService.confirm(appointmentId)
        .then(() => {
          Toast.show('Ha confirmado su asistencia a la cita');
          socket.emit('appointments/confirm', {
            id: appointmentId,
          });
          dispatch(confirmAppointment(appointmentId));
        })
        .catch((err: AxiosError) => {
          console.log('Appointments: confirmAppointment:', err);
          Toast.show('Ha ocurrido un error al confirmar su cita');
        })
        .finally(() => {
          setRefreshing(false);
        });
    },
    [dispatch],
  );

  const doCancelAppointment = useCallback(
    (appointmentId: number) => {
      setRefreshing(true);
      AppointmentsService.cancel(appointmentId)
        .then(() => {
          Toast.show('Ha cancelado su cita');
          socket.emit('appointments/cancel', {
            id: appointmentId,
          });
          dispatch(cancelAppointment(appointmentId));
        })
        .catch((err: AxiosError) => {
          console.log('Appointments: confirmAppointment:', err);
          Toast.show('Ha ocurrido un error al cancelar su cita');
        })
        .finally(() => {
          setRefreshing(false);
        });
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Appointment>) => (
      <Item
        appointment={item}
        onPressConfirm={doConfirmAppointment}
        onPressCancel={doCancelAppointment}
      />
    ),
    [doCancelAppointment, doConfirmAppointment],
  );

  const createAppointment = (): void => {
    navigate('CreateAppointment', {
      onCreateAppointment: () => {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({animated: true, offset: 0});
        });
      },
    });
  };

  AppointmentsService.useCancelListener(({id}) => {
    dispatch(cancelAppointment(id));
  });

  AppointmentsService.useConfirmListener(({id}) => {
    dispatch(confirmAppointment(id));
  });

  AppointmentsService.useFinishListener(({id}) => {
    dispatch(finishAppointment(id));
  });

  const EmptyComponent = (): ReactElement | null =>
    appointments.length === 0 && !refreshing ? (
      <Text style={{textAlign: 'center'}}>No ha agendado ninguna cita</Text>
    ) : null;

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{height: '100%'}}>
        <Header
          backIcon={Icons.home}
          title="Agendar consulta presencial"
          icon={Icons.menu.appointments}
          navigation={navigation}
        />
        <FlatList
          contentContainerStyle={styles.list}
          data={appointments}
          keyExtractor={extractItemKey}
          ref={listRef}
          refreshControl={
            <RefreshControl refreshing={refreshing} enabled={false} />
          }
          renderItem={renderItem}
          ItemSeparatorComponent={(): ReactElement => (
            <View style={{height: 16}} />
          )}
          ListEmptyComponent={EmptyComponent}
        />
        <TouchableOpacity style={styles.addButton} onPress={createAppointment}>
          <Image
            source={Icons.add}
            style={{
              width: 24,
              height: 24,
              resizeMode: 'contain',
              tintColor: 'black',
            }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
