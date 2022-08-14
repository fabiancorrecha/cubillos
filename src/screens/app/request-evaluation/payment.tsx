/* eslint-disable @typescript-eslint/camelcase */

import {Images} from 'assets';
import {AxiosError} from 'axios';
import {CurrencyType} from 'models/currency-type';
import {DocumentType} from 'models/document-type';
import {Price} from 'models/price';
import {SentPhoto} from 'models/sent-photo';
import {User} from 'models/user';
import moment from 'moment';
import React, {ReactElement, useEffect, useState} from 'react';
import {useSocketEvent} from 'hooks';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {EPAYCO_PUBLIC_KEY} from 'react-native-dotenv';
import Toast from 'react-native-root-toast';
import {WebView} from 'react-native-webview';
import {useTypedSelector} from 'reducers';
import {
  DocumentTypesService,
  EpaycoService,
  PaymentCodeService,
  PayPalService,
  PricesService,
  StripeService
} from 'services';
import {formatCurrency, prop, showAlert} from 'utils';
import Colors from 'utils/colors';
import {DateTimePicker, Picker, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import {Procedure} from 'models/procedure';
import {MandatoryPhotos} from './choose-photos';
import {PayPalPayment} from '../appointments';
import Stripe from 'utils/stripe';
import { PAYMENT_METHODS } from 'utils/constants';
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
});

type PaycoProps = {
  loading: boolean;

  onSubmit: (
    name: string,
    lastName: string,
    email: string,
    cardNumber: string,
    cvc: string,
    expirationDate: Date,
    documentType: string,
    documentNumber: string,
    price: number,
  ) => void;
};

const NO_DOCUMENT = {id: 0, name: 'Tipo de documento'};

const Payco = ({loading, onSubmit}: PaycoProps): ReactElement => {
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
  const [expirationDate, setExpirationDate] = useState(minDate);
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
      type: 'evaluation',
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
        <DateTimePicker
          minimumDate={moment()
            .add(1, 'month')
            .toDate()}
          value={expirationDate}
          onChange={(_, newDate): void => {
            setExpirationDate(newDate || expirationDate);
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

type PaymentProps = {
  loading: boolean;

  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos: SentPhoto[];
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
  description: {
    description: string;
    medicines?: string;
    previous_procedures?: string;
    birthdate?: string;
    allergies?: string;
    gender?: string;
    diseases?: string;
  };
  onSubmit: (
    procedures: Set<number>,
    photos: SentPhoto[],
    referencePhotos: SentPhoto[],
    description: {
      description: string;
      medicines?: string;
      previous_procedures?: string;
      birthdate?: string;
      allergies?: string;
      gender?: string;
      diseases?: string;
    },
    info: {
      weight: number;
      weight_unit_id: number;
      height: number;
      height_unit_id: number;
      waist_measurement: number;
      hip_measurement: number;
      bust_size: number;
    },
    payment: string,
    payment_code: string,
    successful: boolean,
    error?: string,
  ) => void;
};

type StripeProps = {
  loading: boolean;
  onSubmit: (payment: string) => void;
  onError: () => void;
}

const StripeComponent = ({loading,onSubmit,onError}: StripeProps): ReactElement => {
  const user = useTypedSelector(prop('user')) as User;
  const [price, setPrice] = useState<'loading' | 'error' | Price>('loading');
  const [number, setNumber] = useState<string | undefined | string>('');
  const [date, setDate] = useState<string | undefined>(undefined);
  const [month, setMonth] = useState<string | undefined>(undefined);
  const [year, setYear] = useState<string | undefined>(undefined);
  const [cvc, setCVC] = useState<string | undefined | string>('');
  const [loadingStripe,setLoadingStripe] = useState<boolean>(false);

  const fetchPrice = (): void => {
    setPrice('loading');

    PricesService.index({
      type: 'evaluation',
      currencyId: CurrencyType.USD,
    })
      .then(prices => {
        setPrice(prices[0]);
      })
      .catch(err => {
        console.log('Strip: fetchPrice:', err);
        setPrice('error');
      });
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  useSocketEvent('prices/update', (): void => {
    fetchPrice();
  });

  const createToken = async () => {
    Keyboard.dismiss();

    if (!number) {
      Toast.show('Debe especificar el número de su tarjeta');
      return;
    }

    if (!month) {
      Toast.show('Debe especificar el mes de vencimiento');
      return;
    }

    if (!year) {
      Toast.show('Debe especificar el año de vencimiento');
      return;
    }

    if (moment(year,'YY').format('YYYY') < moment().format('YYYY')) {
      Toast.show('Lo sentimos, el año de vencimiento no es válido');
      return;
    }

    if (parseInt(month) <= 0 || parseInt(month) > 12) {
      Toast.show('Lo sentimos, el mes de vencimiento no es válido');
      return;
    }

    if (moment(month + '/' + year,'MM/YY') < moment()) {
      Toast.show('Lo sentimos, la fecha de vencimiento debe ser mayor al mes actual');
      return;
    }

    if (!cvc) {
      Toast.show('Debe especificar el código secreto (CVV)');
      return;
    }

    setLoadingStripe(true);

    const res: any = await Stripe.createToken({
      number,
      month: month,
      year: year,
      cvc
    }).catch(err => {
      console.log(err);
    });
    if (res?.id) {
      try {
        const response: any = await StripeService.create({
          user_id: user.id,
          total: typeof price === 'object' ? price.amount : 0,
          token: res.id
        });
        onSubmit(JSON.stringify({
          response_code: response.payment.id,
          user_id: user.id,
          amount: typeof price === 'object' ? price.amount : 0,
          currency_id: CurrencyType.USD,
          method_id: PAYMENT_METHODS.STRIPE
        }));
      }
      catch(e) {
        showAlert("Lo sentimos, no se pudo procesar su pago");
      } finally {
        setLoadingStripe(false);
      }      
    }
    else {
      setLoadingStripe(false);
      showAlert("Lo sentimos, no se pudo procesar su pago");
    }
  }

  return (
    <View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingTop: 16,
          paddingHorizontal: 16,
        }}>
        <Text style={{fontSize: 20}}>Total a pagar: </Text>
        {((): ReactElement => {
          switch(price) {
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

      <View style={{ padding: 20 }}>
        <Text bold style={{marginTop: 8}}>
          Número de la tarjeta
        </Text>
        <TextInput
          value={number}
          maxLength={16}
          keyboardType="number-pad"
          onChangeText={setNumber}
        />
        <Text bold style={{marginTop: 8}}>
          Código secreto (CVV)
        </Text>
        <TextInput
          maxLength={4}
          keyboardType="number-pad"
          onChangeText={setCVC}
          secureTextEntry
          value={cvc}
        />
        <Text bold style={{marginTop: 8}}>
          Fecha de vencimiento de la tarjeta
        </Text>
        {/* <View style={{paddingVertical: 8}}>
          <TextInputMask
            type={'custom'}
            value={ date }
            placeholder="MM/AA"
            options={{
              mask: '12/99'
            }}
            onChangeText={text => {
              setDate(text);
            }}
            style={{
             backgroundColor: Colors.gray,
             fontSize: 12,
             marginVertical: 12,
             padding: 12,
            }}
          />
        </View> */}

        <View style={ { flexDirection: 'row' } }>
          <View style={ { flex: .5 } }>
            <TextInput
              maxLength={2}
              keyboardType="number-pad"
              onChangeText={setMonth}
              value={month}
              placeholder="Mes (MM)"
            />
          </View>
          <View style={ { flex: .5 } }>
            <TextInput
              maxLength={2}
              keyboardType="number-pad"
              onChangeText={setYear}
              value={year}
              placeholder="Año (YY)"
            />
          </View>
        </View>

        {loading || loadingStripe ? (
          <ActivityIndicator
            color={Colors.yellow}
            style={{paddingVertical: 25}}
          />
        ) : (
          <Button
            onPress={() => {
              createToken();
            }}
            style={styles.button}
            titleStyle={styles.buttonTitle}
            textBold
            title="Pagar"
          />
        )}
      </View>
    </View>
  )
};

type PayPalProps = {
  loading: boolean;
  onSubmit: (payment: string) => void;
  onError: () => void;
};

const PayPal = ({loading, onSubmit, onError}: PayPalProps): ReactElement => {
  const user = useTypedSelector(prop('user')) as User;

  const [price, setPrice] = useState<'loading' | 'error' | Price>('loading');
  const [showModal, setShowModal] = useState(false);

  const fetchPrice = (): void => {
    setPrice('loading');

    PricesService.index({
      type: 'evaluation',
      currencyId: CurrencyType.USD,
    })
      .then(prices => {
        setPrice(prices[0]);
      })
      .catch(err => {
        console.log('Paypal: fetchPrice:', err);
        setPrice('error');
      });
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  useSocketEvent('prices/update', (): void => {
    fetchPrice();
  });

  return (
    <View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
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
                <Text style={{color: Colors.blue, fontSize: 20}} bold>
                  {formatCurrency('$', price.amount)}
                </Text>
              );
          }
        })()}
      </View>
      {loading || showModal ? (
        <ActivityIndicator
          color={Colors.yellow}
          style={{paddingVertical: 25}}
        />
      ) : (
        <Button
          onPress={(): void => {
            setShowModal(true);
          }}
          style={styles.button}
          titleStyle={styles.buttonTitle}
          textBold
          title="Pagar con PayPal"
        />
      )}
      {/* {showModal && typeof price === 'object' && (
        <Modal animationType="fade" transparent>
          <View
            style={{
              padding: 16,
              paddingBottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              height: '100%',
            }}>
            <WebView
              source={{uri: PayPalService.FORM_URL}}
              containerStyle={{borderRadius: 8}}
              injectedJavaScript={`
                document.getElementById('price').value = "${price.amount}";
                document.getElementById('user_id').value = "${user.id}";
                document.getElementById('title').value = "Pago de evaluación";
                document.getElementById('form').submit();`}
              onNavigationStateChange={({title}): void => {
                if (title.startsWith('successful:')) {
                  onSubmit(title.replace('successful:', ''));
                  setShowModal(false);
                  return;
                }

                if (title === 'failure') {
                  onError();
                  setShowModal(false);
                  return;
                }
              }}
            />
            <Button
              onPress={(): void => {
                setShowModal(false);
              }}
              style={styles.button}
              titleStyle={styles.buttonTitle}
              textBold
              title="Cancelar"
            />
          </View>
        </Modal>
      )} */}
      {showModal && typeof price === 'object' && (
        <Modal animationType="fade">
          <PayPalPayment
            userId={user.id}
            amount={price.amount}
            onCancel={() => {
              setShowModal(false);
            }}
            onSubmit={payment => {
              onSubmit(payment);
              setShowModal(false);
            }}
            onError={() => {
              onError();
              setShowModal(false);
            }}
          />
        </Modal>
      )}
    </View>
  );
};

type IHaveACodeProps = {
  loading: boolean;
  onSubmit: (payment: string, payment_code: string) => void;
  onError: (message?: string) => void;
};

const IHaveACode = ({loading, onSubmit, onError}: IHaveACodeProps): ReactElement => {
  const user = useTypedSelector(prop('user')) as User;

  const [price, setPrice] = useState<'loading' | 'error' | Price>('loading');
  const [code, setCode] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const fetchPrice = (): void => {
    setPrice('loading');

    PricesService.index({
      type: 'evaluation',
      currencyId: CurrencyType.USD,
    })
      .then(prices => {
        setPrice(prices[0]);
      })
      .catch(err => {
        console.log('Paypal: fetchPrice:', err);
        setPrice('error');
      });
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  useSocketEvent('prices/update', (): void => {
    fetchPrice();
  });

  const verifyCode = (): void => {
    if (typeof price !== 'object' || code === '') {
      return;
    }
    PaymentCodeService.verify({user_id: user.id, payment_code: code})
      .then(() => {
        const payment = {
          amount: price.amount,
          user_id: user.id,
          response_code: code,
          currency_id: CurrencyType.USD, // USD.
          method_id: 4, // Pago por código.
        };
        onSubmit(JSON.stringify(payment), code);
        setShowModal(false);
      })
      .catch(err => {
        console.log('PaymentCode: verifyCode:', err);
        onError('Debes ingresar un código de pago válido, contacta al administrador para mas información');
      });

    setShowModal(false);
  }

  return (
    <View>
      {loading || showModal ? (
        <ActivityIndicator
          color={Colors.yellow}
          style={{paddingVertical: 25}}
        />
      ) : (
        <Button
          onPress={(): void => {
            setShowModal(true);
          }}
          style={styles.button}
          titleStyle={styles.buttonTitle}
          textBold
          title="Tengo un Código"
        />
      )}
      {showModal && typeof price === 'object' && (
        <Modal animationType="fade">
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TextInput
              onChangeText={setCode}
              placeholder="Ingresa el código"
              value={code}
              style={{marginHorizontal: 20}}
            />
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Button
                onPress={(): void => {
                  setShowModal(false);
                }}
                style={[styles.button, { backgroundColor: Colors.black }]}
                titleStyle={styles.buttonTitle}
                textBold
                title="Cancelar"
              />
              <Button
                onPress={(): void => verifyCode()}
                style={styles.button}
                titleStyle={styles.buttonTitle}
                textBold
                title="Verificar código"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export const Payment = ({
  loading,
  description,
  procedures,
  extraPhotos,
  mandatoryPhotos,
  referencePhotos,
  info,
  onSubmit,
}: PaymentProps): ReactElement => {
  const [ownLoading] = useState(false);

  return (
    <View style={{flex: 1}}>
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={{flex: 1}}>
          <PayPal
            loading={ownLoading || loading}
            onSubmit={(payment): void => {
              const payment_code = '';
              const photos = mandatoryPhotos
                ? [
                  ...(Object.values(mandatoryPhotos).filter(
                    it => it !== null,
                  ) as SentPhoto[]),
                  ...extraPhotos,
                ]
                : [];
              onSubmit(
                new Set(Array.from(procedures).map(prop('id'))),
                photos,
                referencePhotos,
                description,
                info,
                payment,
                payment_code,
                true,
              );
            }}
            onError={(): void => {
              console.log("Payment: PayPal's onError");
              showAlert(
                'Lo sentimos',
                'Ha ocurrido un error al procesar su pago',
              );
            }}
          />

          <IHaveACode
            loading={ownLoading || loading}
            onSubmit={(payment, payment_code): void => {
              const photos = mandatoryPhotos
                ? [
                  ...(Object.values(mandatoryPhotos).filter(
                    it => it !== null,
                  ) as SentPhoto[]),
                  ...extraPhotos,
                ]
                : [];
              onSubmit(
                new Set(Array.from(procedures).map(prop('id'))),
                photos,
                referencePhotos,
                description,
                info,
                payment,
                payment_code,
                true,
              );
            }}
            onError={(message): void => {
              console.log("Payment: Code's onError");
              showAlert(
                'Lo sentimos',
                message || 'Ha ocurrido un error al procesar su pago',
              );
            }}
          />

          {/* <StripeComponent
            loading={ownLoading || loading}
            onSubmit={(payment): void => {
              const payment_code = '';
              onSubmit(
                new Set(Array.from(procedures).map(prop('id'))),
                [
                  ...(Object.values(mandatoryPhotos).filter(
                    it => it !== null,
                  ) as SentPhoto[]),
                  ...extraPhotos,
                ],
                referencePhotos,
                description,
                info,
                payment,
                payment_code,
                true,
              );
            }}
            onError={(): void => {
              console.log("Payment: Stripe's onError");
              showAlert(
                'Lo sentimos',
                'Ha ocurrido un error al procesar su pago',
              );
            }}
          />*/}

          <Button
            style={styles.button}
            titleStyle={styles.buttonTitle}
            textBold
            title="Realizar pago manual"
            onPress={() => Linking.openURL('https://openmy.bio/doctor-carlos-ramos')}
          />
        </View>
      </ScrollView>
    </View>
  );
};
