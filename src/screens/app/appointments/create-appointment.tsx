import DateTimePicker from '@react-native-community/datetimepicker';
import {Icons, Images} from 'assets';
import {AxiosError} from 'axios';
import ColombiaHolidays from 'colombia-holidays';
import {useSocketEvent} from 'hooks';
import {CurrencyType} from 'models/currency-type';
import {Price} from 'models/price';
import {Schedule} from 'models/schedule';
import {User} from 'models/user';
import moment, * as Moment from 'moment';
import {extendMoment} from 'moment-range';
import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {useNavigation} from 'react-navigation-hooks';
import {NavigationStackScreenComponent} from 'react-navigation-stack';
import {useTypedSelector} from 'reducers';
import {PricesService, SchedulesService, UsersService} from 'services';
import {ScheduleService} from 'services/admin';
import {AppointmentsService} from 'services/appointments-service';
import {formatCurrency, prop, showAlert} from 'utils';
import Colors from 'utils/colors';
import {Header, Picker, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import ModalContainerIOS from 'widgets/modal-container-ios';
import {PayPal} from './paypal';
import {PayPalPayment} from './paypal-payment';

const SHIFTS = Object.freeze([
  {label: 'Turno', value: 0},
  {label: 'Mañana', value: 1},
  {label: 'Tarde', value: 2},
]);

const _DatepickerContainerQuestions = (props: any) => (
  <DateTimePicker
    locale="es-ES"
    maximumDate={new Date()}
    value={props.date || new Date()}
    mode="date"
    display="default"
    onChange={(_, e) => {
      if (e) {
        if (Platform.OS == 'android') {
          props.success();
        }
        props.onChange(moment(e).format('DD/MM/YYYY'));
      }
    }}
  />
);

const NO_SHIFT = SHIFTS[0].value;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  emptyContainer: {
    justifyContent: 'center',
    padding: 48,
  },
  datePickerBar: {
    alignItems: 'center',
    backgroundColor: Colors.gray,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  datePickerIcon: {
    height: 24,
    width: 24,
  },
  textArea: {
    minHeight: 150,
  },
  birthdate: {
    backgroundColor: Colors.gray,
    fontSize: 12,
    marginVertical: 12,
    padding: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 36,
    flex: 1,
    marginHorizontal: 16,
  },
  datePickerButtonText: {
    textAlign: 'center',
  },
  dateDropDownIcon: {
    height: 18,
    position: 'absolute',
    right: 8,
    width: 18,
  },

  button: {
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 8,
  },
  buttonTitle: {
    color: 'white',
  },
});

const generateHours = ({start, end}: Schedule): string[] => {
  const asMoment = (date: string): moment.Moment => moment(date, 'H:mm:ss');

  const rangeMoment = extendMoment(Moment);

  const range = rangeMoment.range(asMoment(start), asMoment(end));
  return Array.from(range.by('minutes', {step: 15, excludeEnd: true})).map(it =>
    it.format('LT'),
  );
};

export const CreateAppointment: NavigationStackScreenComponent = () => {
  const user = useTypedSelector(prop('user')) as User;
  const navigation = useNavigation();
  const [minDate] = useState(
    moment()
      .add(1, 'day')
      .toDate(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerQuestions, setShowDatePickerQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | null>(null);
  const [shift, setShift] = useState(SHIFTS[0]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [hours, setHours] = useState<'idle' | 'loading' | string[]>('idle');
  const [hour, setHour] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>([]);
  const [medicines, setMedicines] = useState('');
  const [allergies, setAllergies] = useState('');
  const [previousProcedures, setPreviousProcedures] = useState('');
  const [diseases, setDiseases] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [nextQuestions, setNextQuestions] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [price, setPrice] = useState<'loading' | 'error' | Price>('loading');
  const [showMessage, setShowMessage] = useState(false);

  const genders = [
    {value: 'M', label: 'M'},
    {value: 'F', label: 'F'},
  ];

  const fetchPrice = useCallback((): void => {
    setPrice('loading');

    PricesService.index({
      type: 'appointment',
      currencyId: CurrencyType.COP,
    })
      .then(prices => {
        setPrice(prices[0]);
      })
      .catch(err => {
        console.log('CreateAppointment: fetchPrice:', err);
        setPrice('error');
      });
  }, []);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const checkSchedules = useCallback((): void => {
    ScheduleService.all()
      .then((res: any) => {
        setShowMessage(res.schedules == 0);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    checkSchedules();
  }, [checkSchedules]);

  useSocketEvent('prices/update', (): void => {
    fetchPrice();
  });

  const fetchSchedule = useCallback(() => {
    if (!date) {
      return;
    }

    if (shift.value === NO_SHIFT) {
      setHours('idle');
      return;
    }

    setHours('loading');
    SchedulesService.get(
      moment(date).format('YYYY-MM-DD HH:mm:ss'),
      shift.value,
    )
      .then(it => {
        if (!it) {
          Toast.show('No hay citas disponibles para este turno este día');
        }

        const newHours = it ? generateHours(it) : [];

        setSchedule(it);
        setHours(it ? newHours : 'idle');
        setHour(newHours[0]);
      })
      .catch((err: AxiosError) => {
        console.log('CreateAppointment: useEffect:', err);
        setHours('idle');
      });
  }, [date, shift.value]);

  useEffect(() => {
    fetchSchedule();
  }, [date, shift, fetchSchedule]);

  SchedulesService.useReloadScheduleListener(() => {
    fetchSchedule();
  });

  const getFormValidationMessage = (): string | undefined => {
    if (!date) {
      return 'Debe seleccionar la fecha';
    }

    if (!hour || !schedule) {
      return 'Debe seleccionar la hora';
    }

    if (!description) {
      return 'Ingrese una descripción válida';
    }
  };

  const storeAppointment = (paymentJsonString: string): void => {
    const hourMoment = moment(hour, 'H:mm:ss');
    const momentAtMidnight = hourMoment.clone().startOf('day');
    const minutesDiff = hourMoment.diff(momentAtMidnight, 'minutes');

    setSubmitting(true);
    const previous_procedures = previousProcedures;
    const _birthdate = birthdate
      ? moment(birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD')
      : '';

    AppointmentsService.store(
      user.id,
      description,
      moment(date as Date)
        .startOf('day')
        .add(minutesDiff, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss'),
      (schedule as Schedule).id,
      paymentJsonString,
      gender,
      diseases,
      medicines,
      previous_procedures,
      allergies,
      _birthdate,
    )
      .then(() => {
        Toast.show('Se ha creado su cita');
        navigation.goBack();
        navigation.state.params?.onCreateAppointment();
      })
      .catch((err: AxiosError) => {
        showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        console.log('CreateAppointment: submit:', err);
        setSubmitting(false);
      });
  };

  const payWithPaypal = (): void => {
    Keyboard.dismiss();

    const validationMessage = getFormValidationMessage();
    if (validationMessage) {
      Toast.show(validationMessage);
      return;
    }

    setShowPayPalModal(true);
  };

  const payWithPayco = (): void => {
    Keyboard.dismiss();

    const validationMessage = getFormValidationMessage();
    if (validationMessage) {
      Toast.show(validationMessage);
      return;
    }

    navigation.navigate('PayAppointmentWithPayco', {
      checkAvailability: async () => {
        if (!date) {
          return false;
        }

        if (!schedule) {
          return false;
        }

        try {
          const schedule = await SchedulesService.get(
            moment(date).format('YYYY-MM-DD HH:mm:ss'),
            shift.value,
          );

          return !!schedule;
        } catch (err) {
          console.log('CreateAppointment: checkAvailability');
          return false;
        }
      },
      onSuccess: storeAppointment,
      onFailure: (paymentJsonString: string, reason: string): void => {
        AppointmentsService.storeFailedPayment(paymentJsonString);
        Toast.show(reason);
      },
    });
  };

  const _DatepickerContainer = (): ReactElement => (
    <DateTimePicker
      locale="es-ES"
      minimumDate={minDate}
      value={date || new Date()}
      mode="date"
      display="default"
      onChange={(_, newDate): void => {
        if (Platform.OS === 'android') {
          setShowDatePicker(false);
        }

        if (!newDate) {
          return;
        }

        {
          const yearHolidays = ColombiaHolidays.getColombiaHolidaysByYear(
            newDate.getFullYear(),
          );
          const newDateString = moment(newDate).format('YYYY-MM-DD');
          if (
            yearHolidays.find(
              ({holiday}: {holiday: string}) => holiday === newDateString,
            )
          ) {
            Toast.show('Lo sentimos, el día seleccionado es un día festivo');
            return;
          }
        }

        setDate(newDate);
      }}
    />
  );

  const fetchData = useCallback(() => {
    UsersService.getData(user.id)
      .then((data: any) => {
        setLoading(false);
        setData(data);
      })
      .catch((err: any) => console.log(err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showQuestions =
    !data.previous_procedures ||
    !data.diseases ||
    !data.medicines ||
    !data.allergies ||
    !data.gender ||
    !data.birthdate;

  const updateQuestionsBirthdate = (newDate: string): void => {
    if (moment().diff(moment(newDate, 'DD/MM/YYYY'), 'years') < 18) {
      Toast.show('Solo apto para mayores de 18 años');
    } else {
      setBirthdate(newDate);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <Header
          title="Agendar consulta presencial"
          icon={Icons.menu.appointments}
          navigation={navigation}
        />
        {!loading ? (
          <React.Fragment>
            {!showMessage ? (
              <ScrollView
                contentContainerStyle={{paddingBottom: 16}}
                keyboardShouldPersistTaps="always">
                {showQuestions && !nextQuestions ? (
                  <View style={{padding: 16}}>
                    {!data.previous_procedures && (
                      <TextInput
                        textAlignVertical="top"
                        onChangeText={setPreviousProcedures}
                        placeholder="Procedimientos quirúrgicos anteriores"
                        value={previousProcedures}
                        multiline={true}
                        numberOfLines={5}
                        style={styles.textArea}
                      />
                    )}
                    {!data.diseases && (
                      <TextInput
                        textAlignVertical="top"
                        onChangeText={setDiseases}
                        placeholder="¿Padece de alguna enfermedad?"
                        value={diseases}
                        multiline={true}
                        numberOfLines={5}
                        style={styles.textArea}
                      />
                    )}
                    {!data.medicines && (
                      <TextInput
                        textAlignVertical="top"
                        onChangeText={setMedicines}
                        placeholder="¿Toma algún medicamento?"
                        value={medicines}
                        multiline={true}
                        numberOfLines={5}
                        style={styles.textArea}
                      />
                    )}
                    {!data.allergies && (
                      <TextInput
                        textAlignVertical="top"
                        onChangeText={setAllergies}
                        placeholder="¿Es alérgico a algún medicamento?"
                        value={allergies}
                        multiline={true}
                        numberOfLines={5}
                        style={styles.textArea}
                      />
                    )}
                    {!data.birthdate && (
                      <TouchableWithoutFeedback
                        onPress={() => {
                          setShowDatePickerQuestions(true);
                        }}>
                        <View>
                          <Text bold>Fecha de Nacimiento</Text>
                          <View style={styles.birthdate}>
                            <Text>{birthdate}</Text>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                    {!data.gender && (
                      <View>
                        <Text bold>Género</Text>
                        <Picker
                          displayValue={gender}
                          onValueChange={(e: any) => {
                            if (e != '') {
                              setGender(e);
                            }
                          }}
                          selectedValue={gender}>
                          <Picker.Item value={''} label={'Seleccione'} />
                          {/* */}
                          {genders.map((i: any) => (
                            <Picker.Item
                              key={i.value.toString()}
                              value={i.value}
                              label={i.label}
                            />
                          ))}
                        </Picker>
                      </View>
                    )}

                    <Button
                      style={{
                        backgroundColor: Colors.blue,
                        borderRadius: 100,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        minWidth: 200,
                        alignSelf: 'center',
                      }}
                      textBold
                      titleStyle={{color: 'white', textAlign: 'center'}}
                      title="Siguiente"
                      onPress={() => {
                        setNextQuestions(true);
                      }}
                    />
                  </View>
                ) : (
                  <React.Fragment>
                    <View style={styles.datePickerBar}>
                      <Image
                        source={Icons.calendar}
                        style={styles.datePickerIcon}
                      />
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={(): void => {
                          setShowDatePicker(true);
                        }}>
                        <Text style={styles.datePickerButtonText} bold>
                          {date
                            ? moment(date).format('D [de] MMMM')
                            : 'Seleccione la fecha'}
                        </Text>
                        <Image
                          source={Icons.dropDown}
                          style={styles.dateDropDownIcon}
                        />
                      </TouchableOpacity>
                      {/* Esto solo ocupa espacio, por simetría. */}
                      <View style={styles.datePickerIcon} />
                    </View>
                    <RNText style={{fontStyle: 'italic', textAlign: 'center'}}>
                      Solo se agendan citas para los días Lunes
                    </RNText>
                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingBottom: 8,
                        paddingTop: 16,
                        paddingHorizontal: 16,
                      }}>
                      <Text style={{fontSize: 20}}>Total a pagar: </Text>
                      {((): ReactElement => {
                        switch (price) {
                          case 'loading':
                            return <ActivityIndicator color={Colors.yellow} />;

                          case 'error':
                            return <Text>Ha ocurrido un error</Text>;

                          default:
                            return (
                              <Text
                                style={{color: Colors.blue, fontSize: 20}}
                                bold>
                                {formatCurrency('$', price.amount)}
                              </Text>
                            );
                        }
                      })()}
                    </View>
                    <View style={{flexDirection: 'row', paddingHorizontal: 16}}>
                      <Picker
                        containerStyle={{flex: 1}}
                        displayValue={shift.label}
                        onValueChange={(newValue): void => {
                          const newShift = SHIFTS.find(
                            ({value}) => value === newValue,
                          );
                          if (!newShift) {
                            return;
                          }

                          setShift(newShift);
                        }}
                        selectedValue={shift.value}>
                        {SHIFTS.map(({value, label}) => (
                          <Picker.Item
                            key={value.toString()}
                            value={value}
                            label={label}
                          />
                        ))}
                      </Picker>
                      <View style={{width: 16}} />
                      {hours === 'loading' ? (
                        <View style={{flex: 1, alignSelf: 'center'}}>
                          <ActivityIndicator color={Colors.yellow} />
                        </View>
                      ) : (
                        <Picker
                          containerStyle={{flex: 1}}
                          displayValue={hours === 'idle' ? 'Hora' : hour}
                          icon={Icons.clock}
                          textContainerStyle={{
                            opacity:
                              shift.value === NO_SHIFT ||
                              !date ||
                              !Array.isArray(hours)
                                ? 0.5
                                : 1,
                          }}
                          onValueChange={(newHour): void => setHour(newHour)}
                          selectedValue={hour}>
                          {hours !== 'idle'
                            ? hours.map((hour: string) => (
                                <Picker.Item
                                  key={hour}
                                  value={hour}
                                  label={hour}
                                />
                              ))
                            : []}
                        </Picker>
                      )}
                    </View>
                    <TextInput
                      multiline
                      numberOfLines={5}
                      onChangeText={setDescription}
                      placeholder="Descripción"
                      style={{
                        marginTop: 0,
                        marginHorizontal: 16,
                        minHeight: 100,
                      }}
                      textAlignVertical="top"
                      value={description}
                    />
                    <View
                      style={{
                        alignSelf: 'center',
                      }}>
                      {submitting ? (
                        <ActivityIndicator
                          style={{padding: 8}}
                          color={Colors.yellow}
                        />
                      ) : (
                        <Button
                          style={{
                            backgroundColor: Colors.blue,
                            borderRadius: 100,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                          }}
                          textBold
                          titleStyle={{color: 'white'}}
                          title="Pagar con ePayco"
                          onPress={payWithPayco}
                        />
                      )}
                    </View>
                  </React.Fragment>
                )}
              </ScrollView>
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#f44336',
                  marginTop: 20,
                  width: '90%',
                  alignSelf: 'center',
                  fontSize: 18
                } }>
                  Lo sentimos, actualmente no estamos agendando consulta presencial
                </Text>
              )
            }

            {Platform.OS == 'ios' ? (
              <ModalContainerIOS
                visible={showDatePicker}
                success={(): void => setShowDatePicker(false)}>
                <_DatepickerContainer />
              </ModalContainerIOS>
            ) : (
              showDatePicker && <_DatepickerContainer />
            )}

            {Platform.OS == 'ios' ? (
              <ModalContainerIOS
                visible={showDatePickerQuestions}
                success={() => setShowDatePickerQuestions(false)}>
                <_DatepickerContainerQuestions
                  date={
                    birthdate ? moment(birthdate, 'DD/MM/YYYY').toDate() : null
                  }
                  onChange={updateQuestionsBirthdate}
                  success={() => setShowDatePickerQuestions(false)}
                />
              </ModalContainerIOS>
            ) : (
              showDatePickerQuestions && (
                <_DatepickerContainerQuestions
                  date={
                    birthdate ? moment(birthdate, 'DD/MM/YYYY').toDate() : null
                  }
                  onChange={updateQuestionsBirthdate}
                  success={() => setShowDatePickerQuestions(false)}
                />
              )
            )}

            {showPayPalModal && typeof price === 'object' && (
              <Modal animationType="fade">
                <PayPalPayment
                  userId={user.id}
                  amount={price.amount}
                  onSubmit={(jsonPaymentString): void => {
                    storeAppointment(jsonPaymentString);
                    setShowPayPalModal(false);
                  }}
                  onError={(): void => {
                    console.log("Couldn't make a payment with PayPal");
                    Toast.show('Ha ocurrido un error al hacer el pago');
                    setShowPayPalModal(false);
                  }}
                  onCancel={(): void => {
                    console.log('User canceled the PayPal payment');
                    setShowPayPalModal(false);
                  }}
                />
              </Modal>
            )}
          </React.Fragment>
        ) : (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

CreateAppointment.navigationOptions = {headerShown: false};
