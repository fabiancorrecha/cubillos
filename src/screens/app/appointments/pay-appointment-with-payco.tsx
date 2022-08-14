/* eslint-disable @typescript-eslint/camelcase */
import {Icons, Images} from 'assets';
import {AxiosError} from 'axios';
import {CurrencyType} from 'models/currency-type';
import {DocumentType} from 'models/document-type';
import {Price} from 'models/price';
import {User} from 'models/user';
import moment from 'moment';
import React, {ReactElement, useEffect, useState} from 'react';
import { useSocketEvent } from 'hooks';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {EPAYCO_PUBLIC_KEY} from 'react-native-dotenv';
import Toast from 'react-native-root-toast';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import {NavigationStackScreenComponent} from 'react-navigation-stack';
import {useTypedSelector} from 'reducers';
import {DocumentTypesService, EpaycoService, PricesService} from 'services';
import {formatCurrency, prop, showAlert} from 'utils';
import Colors from 'utils/colors';
import {DateTimePicker, OptionsMenu, Picker, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import { TextInputMask } from 'react-native-masked-text'

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
  },
  buttonTitle: {
    color: 'white',
  },

  header: {
    backgroundColor: Colors.blue,
  },
  homeButton: {
    left: 4,
  },
  optionsButton: {
    right: 4,
    position: 'absolute',
  },
  headerButton: {
    height: 24,
    width: 24,
  },
  headerButtonContainer: {
    padding: 12,
  },
});

type FormProps = {
  loading: boolean;
  onSubmit: (
    name: string,
    lastName: string,
    email: string,
    cardNumber: string,
    cvc: string,
    expirationDate: string,
    documentType: string,
    documentNumber: string,
    price: number,
  ) => void;
};

const NO_DOCUMENT = {id: 0, name: 'Tipo de documento'};

const PaycoForm = ({loading, onSubmit}: FormProps): ReactElement => {
  const user = useTypedSelector(prop('user')) as User;
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [minDate] = useState(
    moment()
      .add(1, 'month')
      .toDate(),
  );
  const [expirationDate, setExpirationDate] = useState('');
  const [documentType, setDocumentType] = useState(NO_DOCUMENT.id);
  const [documentNumber, setDocument] = useState('');
  const [documentTypes, setDocumentTypes] = useState<
    'loading' | 'error' | DocumentType[]
  >('loading');
  const [price, setPrice] = useState<'loading' | 'error' | Price>('loading');

  const fetchDocumentTypes = (): void => {
    setDocumentTypes('loading');

    DocumentTypesService.index()
      .then(setDocumentTypes)
      .catch((err: AxiosError) => {
        console.log('Payment: useEffect', err);
        setDocumentTypes('error');
      });
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchPrice = (): void => {
    setPrice('loading');

    PricesService.index({
      type: 'appointment',
      currencyId: CurrencyType.COP,
    })
      .then(prices => {
        setPrice(prices[0]);
      })
      .catch(err => {
        console.log('Payment: fetchPrice:', err);
        setPrice('error');
      });
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  useSocketEvent('prices/update', (): void => {
    fetchPrice();
  });

  const submit = (): void => {
    Keyboard.dismiss();

    if (!name) {
      Toast.show('Debe especificar su nombre');
      return;
    }

    if (!lastName) {
      Toast.show('Debe especificar su apellido');
      return;
    }

    if (!email) {
      Toast.show('Debe especificar su correo electrónico');
      return;
    }

    if (!cardNumber) {
      Toast.show('Debe especificar el número de su tarjeta');
      return;
    }

    if (documentType == NO_DOCUMENT.id) {
      Toast.show('Debe seleccionar el tipo de documento');
      return;
    }

    if (!documentNumber) {
      Toast.show('Debe especificar el número de su documento');
      return;
    }

    onSubmit(
      name,
      lastName,
      email,
      cardNumber,
      cvc,
      expirationDate,
      (documentTypes as DocumentType[]).find(({id}) => id === documentType)
        ?.name ?? '',
      documentNumber,
      (price as Price).amount,
    );
  };

  if (documentTypes === 'loading') {
    return (
      <View style={{padding: 16}}>
        <ActivityIndicator color={Colors.yellow} />
      </View>
    );
  }

  if (documentTypes === 'error') {
    return (
      <View style={{alignItems: 'center', paddingTop: 16}}>
        <Text>Ha ocurrido un error al cargar el formulario</Text>
        <Button
          style={styles.button}
          textBold
          titleStyle={styles.buttonTitle}
          title="Reintentar"
          onPress={fetchDocumentTypes}
        />
      </View>
    );
  }

  return (
    <View style={{paddingHorizontal: 16, paddingTop: 8}}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingVertical: 8,
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
                <Text style={{color: Colors.blue, fontSize: 20}} bold>
                  {formatCurrency('$', price.amount)}
                </Text>
              );
          }
        })()}
      </View>
      <TextInput value={name} placeholder="Nombre" onChangeText={setName} />
      <TextInput
        value={lastName}
        placeholder="Apellido"
        onChangeText={setLastName}
      />
      <TextInput
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        value={email}
      />
      <TextInput
        value={cardNumber}
        maxLength={16}
        keyboardType="number-pad"
        placeholder="Número de la tarjeta"
        onChangeText={setCardNumber}
      />
      <TextInput
        maxLength={4}
        keyboardType="number-pad"
        onChangeText={setCvc}
        placeholder="Código secreto (CVV)"
        secureTextEntry
        value={cvc}
      />
      <Text bold style={{marginTop: 8}}>
        Fecha de expiración
      </Text>
      <View style={{paddingVertical: 8}}>
        {/* <DateTimePicker
          minimumDate={moment()
            .add(1, 'month')
            .toDate()}
          value={expirationDate}
          onChange={(_, newDate): void => {
            setExpirationDate(newDate || expirationDate);
          }}
        /> */}

        <TextInputMask
          type={'custom'}
          value={ expirationDate }
          placeholder="MM/AA"
          options={{
            mask: '12/99'
          }}
          onChangeText={text => {
            setExpirationDate(text);
          }}
          style={{
           backgroundColor: Colors.gray,
           fontSize: 12,
           marginVertical: 12,
           padding: 12,
           marginBottom: 5
          }}
        />
      </View>
      <Picker
        containerStyle={{marginBottom: 8}}
        displayValue={
          documentTypes.find(({id}) => id === documentType)?.name ??
          NO_DOCUMENT.name
        }
        onValueChange={(newDocumentType): void =>
          setDocumentType(newDocumentType)
        }
        selectedValue={documentType}>
        {[NO_DOCUMENT, ...documentTypes].map(({name, id}) => (
          <Picker.Item key={id} value={id} label={name} />
        ))}
      </Picker>
      <TextInput
        keyboardType="numeric"
        onChangeText={setDocument}
        placeholder="Número de documento"
        style={{marginBottom: 0}}
        value={documentNumber}
      />
      {loading ? (
        <ActivityIndicator
          color={Colors.yellow}
          style={{paddingVertical: 25}}
        />
      ) : (
        <TouchableOpacity
          onPress={submit}
          style={[styles.button, {flexDirection: 'row'}]}>
          <Text bold style={styles.buttonTitle}>
            Pagar con
          </Text>
          <Image
            source={Images.ePayco}
            style={{
              height: 22,
              width: 64,
              marginStart: 8,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

type SuccessFunc = (paymentJsonString: string) => void;
type FailureFunc = (paymentJsonString: string, reason: string) => void;
type CheckAvailabilityFunc = () => Promise<boolean>;
type Params = {
  onSuccess: SuccessFunc;
  onFailure: FailureFunc;
  checkAvailability: CheckAvailabilityFunc;
};

export const PayAppointmentWithPayco: NavigationStackScreenComponent<Params> = () => {
  const user = useTypedSelector(prop('user')) as User;
  const {navigate, goBack} = useNavigation<Params>();

  const [loading, setLoading] = useState(false);

  const onSuccess = useNavigationParam('onSuccess') as SuccessFunc;
  const onFailure = useNavigationParam('onFailure') as FailureFunc;
  const checkAvailability = useNavigationParam(
    'checkAvailability',
  ) as CheckAvailabilityFunc;

  return (
    <View style={{height: '100%'}}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButtonContainer, styles.homeButton]}
          onPress={(): void => {
            goBack();
          }}>
          <Image style={styles.headerButton} source={Icons.back} />
        </TouchableOpacity>
        <View style={[styles.headerButtonContainer, styles.optionsButton]}>
          <OptionsMenu
            options={[
              {
                label: 'Editar perfil',
                action: (): void => {
                  navigate('Profile');
                },
              },
              {
                label: 'Cerrar sesión',
                action: (): void => {
                  navigate('Logout');
                },
              },
            ]}>
            <Image source={Icons.hamburgerMenu} style={styles.headerButton} />
          </OptionsMenu>
        </View>
      </View>
      <ScrollView keyboardShouldPersistTaps="always">
        <PaycoForm
          loading={loading}
          onSubmit={(
            name,
            lastName,
            email,
            cardNumber,
            cvc,
            expirationDate,
            documentType,
            documentNumber,
            price,
          ): void => {
            setLoading(true);

            checkAvailability().then(available => {
              if (!available) {
                Toast.show('Ya no hay cupos disponibles para este día y turno');
                goBack();
                return;
              }

              EpaycoService.setPublicKey(EPAYCO_PUBLIC_KEY)
                .then(() =>
                  EpaycoService.createToken({
                    card: {
                      name,
                      email,
                      cvc,
                      last_name: lastName,
                      number: cardNumber,
                      doc_type: documentType,
                      doc_number: documentNumber.toString(),
                      exp_month: moment(expirationDate,'MM/YY').format('MM'),
                      exp_year: moment(expirationDate,'MM/YY').format('YY'),
                    },
                  }),
                )
                .then(token =>
                  EpaycoService.pay(
                    name,
                    lastName,
                    price,
                    email,
                    documentType.toString(),
                    documentNumber,
                    user.id,
                    token,
                  ),
                )
                .then(charge => {
                  const jsonPaymentString = JSON.stringify({
                    amount: price,
                    user_id: user.id,
                    currency_id: CurrencyType.COP,
                    method_id: 2,
                    response_code:
                      charge?.data?.ref_payco ??
                      charge?.description,
                    status: charge?.data?.estado === 'Aceptada' ? 1 : 0,
                  });

                  setLoading(false);

                  if (charge?.data?.estado === 'Aceptada') {
                    onSuccess(jsonPaymentString);
                    goBack();
                  } else {
                    onFailure(jsonPaymentString, charge?.data?.respuesta);
                  }
                })
                .catch(err => {
                  if (err?.response?.data?.charge?.data?.errors) {
                    setLoading(false);
                    showAlert(
                      'Ha ocurrido un error al procesar su pago',
                      err.response.data.charge.data.errors[0].errorMessage,
                    );
                    return;
                  }

                  if (err?.description) {
                    if (err?.type == 104) {
                      setLoading(false);
                      showAlert(
                        'Lo sentimos',
                        'Por favor espere unos segundos antes de enviar su pago de nuevo',
                      );
                      return;
                    }

                    setLoading(false);
                    showAlert('Datos inválidos', err.description);
                    return;
                  }

                  console.log('Payment: onSubmit:', err);
                  showAlert(
                    'Lo sentimos',
                    'Ha ocurrido un error al conectarse con ePayco',
                  );
                  setLoading(false);
                });
            });
          }}
        />
      </ScrollView>
    </View>
  );
};

PayAppointmentWithPayco.navigationOptions = {
  headerShown: false,
};
