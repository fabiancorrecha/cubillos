/* eslint-disable @typescript-eslint/camelcase */
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {SentPhoto} from 'models/sent-photo';
import {User} from 'models/user';
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  BackHandler,
  LayoutChangeEvent,
  SafeAreaView,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {useNavigation} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {EvaluationsService} from 'services';
import {exhaustiveCheck, prop, showAlert} from 'utils';
import Colors from 'utils/colors';
import {Header, Text} from 'widgets';
import {AddDescription} from './add-description';
import {AddInfo} from './add-info';
import {ChoosePhotos, MandatoryPhotos} from './choose-photos';
import {ChooseProcedures} from './choose-procedures';
import {ChooseReferencePhotos} from './choose-reference-photos';
import {Payment} from './payment';
import {Verified} from './verified';
import {Procedure} from 'models/procedure';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationStackScreenProps } from 'react-navigation-stack';

type ProceduresStep = {
  type: 'procedures';
  procedures?: Set<Procedure>;
};

type InfoStep = {
  type: 'info';
  procedures: Set<Procedure>;
  info?: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
};

type PhotosStep = {
  type: 'photos';
  procedures: Set<Procedure>;
  extraPhotos?: SentPhoto[];
  mandatoryPhotos?: MandatoryPhotos;
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
};

type ReferencePhotosStep = {
  type: 'reference-photos';
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos?: SentPhoto[];
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
};

type DescriptionStep = {
  type: 'description';
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos: SentPhoto[];
  description?: {
    description: string;
    medicines?: string;
    previous_procedures?: string;
    birthdate?: string;
    allergies?: string;
    gender?: string;
    diseases?: string;
  };
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
};

type VerifiedStep = {
  type: 'verified';
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos: SentPhoto[];
  description: {
    description: string;
    medicines?: string;
    previous_procedures?: string;
    birthdate?: string;
    allergies?: string;
    gender?: string;
    diseases?: string;
  };
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
};

type PaymentStep = {
  type: 'payment';
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos: SentPhoto[];
  description: {
    description: string;
    medicines?: string;
    previous_procedures?: string;
    birthdate?: string;
    allergies?: string;
    gender?: string;
    diseases?: string;
  };
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
};

type Step =
  | ProceduresStep
  | PhotosStep
  | ReferencePhotosStep
  | InfoStep
  | PaymentStep
  | DescriptionStep
  | VerifiedStep;

type TabData = {label: string; onPress?: () => void};

type TabProps = {
  active?: boolean;
  style?: StyleProp<ViewStyle>;
} & TabData;

type TabBarProps = {
  leftTab?: TabData;
  centerTab?: TabData;
  rightTab?: TabData;
};

const Tab = ({active, label, onPress, style}: TabProps): ReactElement => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center'},
        style,
      ]}>
      <Text
        bold
        style={{
          color: Colors.blue,
          textAlign: 'center',
          opacity: active ? 1 : 0.33,
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const TabBar = ({leftTab, centerTab, rightTab}: TabBarProps): ReactElement => {
  const [width, setWidth] = useState(0);
  const doSetWidth = useCallback((event: LayoutChangeEvent): void => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View
      onLayout={doSetWidth}
      style={{
        width: '100%',
        backgroundColor: Colors.yellow,
      }}>
      <View style={{left: -width / 4, flexDirection: 'row'}}>
        <View style={{width: width / 2}}>
          {leftTab && <Tab {...leftTab} style={{width: width / 2}} />}
        </View>
        <View style={{width: width / 2}}>
          {centerTab && (
            <Tab {...centerTab} active style={{width: width / 2}} />
          )}
        </View>
        <View style={{width: width / 2}}>
          {rightTab && <Tab {...rightTab} style={{width: width / 2}} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  innerTabBar: {
    backgroundColor: '#272b2e',
    flexDirection: 'row',
    width: '100%',
  },
  innerTabTextContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  innerTabText: {
    color: Colors.gray2,
    fontSize: 12,
    textAlign: 'center',
  },
  innerTab: {
    flex: 1,
    justifyContent: 'center',
  },
  innerTabSelected: {
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
  innerTabTextSelected: {
    color: Colors.blue,
  },
  innerTabContent: {
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
});

type InnerTabProps = {
  isSelected?: boolean;
  onPress?: () => void;
  label: string;
};

const InnerTab = ({
  isSelected,
  onPress,
  label,
}: InnerTabProps): ReactElement => (
  <View style={[styles.innerTab, isSelected ? styles.innerTabSelected : null]}>
    <TouchableOpacity onPress={onPress}>
      <View style={styles.innerTabTextContainer}>
        <Text
          bold
          style={[
            styles.innerTabText,
            isSelected ? styles.innerTabTextSelected : null,
          ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

export const RequestEvaluation = ({ navigation: navProps}: NavigationStackScreenProps): ReactElement => {
  const initialStep = navProps.state?.params?.initialStep || 'procedures';
  const initialForm = navProps.state?.params?.pendingEvaluation?.id ? navProps.state.params.pendingEvaluation : {};
  const [formSaved, setFormSaved] = useState<boolean>(initialForm?.hasOwnProperty('id') || false);
  const navigation = useNavigation();
  const user = useTypedSelector(prop('user')) as User;
  const [step, setStep] = useState<Step>({...initialForm, type: initialStep});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // TODO: El diseño no contempla el hecho de que iOS no tiene botón para
    //       ir atras.
    const listener = (): boolean => {
      switch (step.type) {
        case 'procedures':
          return false;
        case 'info':
          setStep({...step, type: 'procedures'});
          return true;
        case 'photos':
          setStep({...step, type: 'info'});
          return true;
        case 'reference-photos':
          setStep({...step, type: 'photos'});
          return true;
        case 'description':
          setStep({...step, type: 'reference-photos'});
          return true;
        case 'verified':
          setStep({...step, type: 'description'});
          return true;
        case 'payment':
          setStep({...step, type: 'verified'});
          return true;
        default:
          exhaustiveCheck(step);
          return false;
      }
    };

    BackHandler.addEventListener('hardwareBackPress', listener);
    return (): void =>
      BackHandler.removeEventListener('hardwareBackPress', listener);
  }, [step]);

  return (
    <React.Fragment>
      <Spinner
        visible={ loading }
        textContent={ percentage + '%' }
        size="large"
      />

      <SafeAreaView style={{flex: 1}}>
        <View style={{height: '100%'}}>
          <Header
            backIcon={Icons.home}
            icon={Icons.menu.evaluation}
            navigation={navigation}
            title="Asesoría online"
          />
          <View style={{flex: 1, backgroundColor: 'white'}}>
            {((): ReactNode => {
              switch (step.type) {
                case 'procedures':
                  return (
                    <>
                      <TabBar
                        centerTab={{
                          label: 'Operaciones',
                        }}
                        rightTab={{
                          label: 'Fotos',
                        }}
                      />
                      <ChooseProcedures
                        onSubmit={(procedures): void => {
                          setStep({...step, type: 'info', procedures});
                        }}
                        onError={(err: AxiosError): void => {
                          console.log('Procedures: on load: ', err);
                          showAlert(
                            'Lo sentimos',
                            'Ha ocurrido un error desconocido',
                          );
                          navigation.goBack();
                        }}
                        initialProcedures={step.procedures}
                      />
                    </>
                  );
                case 'info':
                  return (
                    <>
                      <TabBar
                        leftTab={{
                          label: 'Operaciones',
                          onPress: (): void => {
                            setStep({...step, type: 'procedures'});
                          },
                        }}
                        centerTab={{
                          label: 'Información',
                        }}
                        rightTab={{
                          label: 'Fotos',
                        }}
                      />
                      <AddInfo
                        onBack={(): void => {
                          setStep({...step, type: 'procedures'});
                        }}
                        procedures={step.procedures}
                        initialInfo={step.info}
                        onSubmit={(procedures, info): void => {
                          setStep({
                            ...step,
                            type: 'photos',
                            procedures,
                            info,
                          });
                        }}
                      />
                    </>
                  );
                case 'photos':
                  return (
                    <>
                      <TabBar
                        leftTab={{
                          label: 'Información',
                          onPress: (): void => {
                            setStep({
                              ...step,
                              type: 'info',
                            });
                          },
                        }}
                        centerTab={{
                          label: 'Fotos',
                        }}
                        rightTab={{
                          label: 'Observaciones',
                        }}
                      />
                      <View style={{flex: 1}}>
                        <View style={styles.innerTabBar}>
                          <InnerTab label="Apariencia actual" isSelected />
                          <InnerTab label="Más fotos (opcional)" />
                        </View>
                        <View style={styles.innerTabContent}>
                          <ChoosePhotos
                            info={step.info}
                            procedures={step.procedures}
                            onBack={(): void => {
                              setStep({
                                ...step,
                                type: 'info',
                              });
                            }}
                            initialExtraPhotos={step.extraPhotos}
                            initialMandatoryPhotos={step.mandatoryPhotos}
                            onSubmit={(
                              procedures,
                              extraPhotos,
                              mandatoryPhotos,
                              info,
                            ): void => {
                              setStep({
                                ...step,
                                type: 'reference-photos',
                                procedures,
                                extraPhotos,
                                mandatoryPhotos,
                                info,
                              });
                            }}
                          />
                        </View>
                      </View>
                    </>
                  );
                case 'reference-photos':
                  return (
                    <>
                      <TabBar
                        leftTab={{
                          label: 'Información',
                          onPress: (): void => {
                            setStep({
                              ...step,
                              type: 'info',
                            });
                          },
                        }}
                        centerTab={{
                          label: 'Fotos',
                        }}
                        rightTab={{
                          label: 'Observaciones',
                        }}
                      />
                      <View style={{flex: 1}}>
                        <View style={styles.innerTabBar}>
                          <InnerTab
                            label="Apariencia actual"
                            onPress={(): void => {
                              setStep({
                                ...step,
                                type: 'photos',
                              });
                            }}
                          />
                          <InnerTab label="Más fotos (opcional)" isSelected />
                        </View>
                        <View style={styles.innerTabContent}>
                          <ChooseReferencePhotos
                            procedures={step.procedures}
                            extraPhotos={step.extraPhotos}
                            mandatoryPhotos={step.mandatoryPhotos}
                            initialReferencePhotos={step.referencePhotos}
                            info={step.info}
                            onBack={(): void => {
                              setStep({
                                ...step,
                                type: 'photos',
                              });
                            }}
                            onSubmit={(
                              procedures,
                              extraPhotos,
                              mandatoryPhotos,
                              referencePhotos,
                              info,
                            ): void => {
                              setStep({
                                ...step,
                                type: 'description',
                                procedures,
                                info,
                                extraPhotos,
                                mandatoryPhotos,
                                referencePhotos,
                              });
                            }}
                          />
                        </View>
                      </View>
                    </>
                  );
                case 'description':
                  return (
                    <>
                      <TabBar
                        leftTab={{
                          label: 'Fotos',
                          onPress: (): void => {
                            setStep({
                              ...step,
                              type: 'reference-photos',
                            });
                          },
                        }}
                        centerTab={{
                          label: 'Observaciones',
                        }}
                        rightTab={{
                          label: 'Verificar',
                        }}
                      />
                      <AddDescription
                        procedures={step.procedures}
                        extraPhotos={step.extraPhotos}
                        mandatoryPhotos={step.mandatoryPhotos}
                        referencePhotos={step.referencePhotos}
                        initialDescription={step.description}
                        info={step.info}
                        onBack={(): void => {
                          setStep({
                            ...step,
                            type: 'reference-photos',
                          });
                        }}
                        onSubmit={(
                          procedures,
                          extraPhotos,
                          mandatoryPhotos,
                          referencePhotos,
                          info,
                          description,
                        ): void => {
                          setStep({
                            ...step,
                            type: 'verified',
                            procedures,
                            extraPhotos,
                            mandatoryPhotos,
                            referencePhotos,
                            info,
                            description,
                          });
                        }}
                      />
                    </>
                  );
                case 'verified':
                  return (
                    <>
                      <TabBar
                        leftTab={{
                          label: 'Observaciones',
                          onPress: (): void => {
                            setStep({
                              ...step,
                              type: 'description',
                            });
                          },
                        }}
                        centerTab={{
                          label: 'Verificar',
                        }}
                        rightTab={{
                          label: 'Pago',
                        }}
                      />
                      <Verified
                        navigation={navigation}
                        onBack={(): void => {
                          setStep({
                            ...step,
                            type: 'description',
                          });
                        }}
                        procedures={step.procedures}
                        extraPhotos={step.extraPhotos}
                        mandatoryPhotos={step.mandatoryPhotos}
                        referencePhotos={step.referencePhotos}
                        info={step.info}
                        description={step.description}
                        onSubmit={(
                          procedures,
                          photos,
                          extraPhotos,
                          mandatoryPhotos,
                          referencePhotos,
                          info,
                          description,
                        ): void => {
                          if (!formSaved) {
                            setLoading(true);
                            EvaluationsService.create(
                              user.id,
                              new Set(Array.from(procedures).map(prop('id'))),
                              photos,
                              referencePhotos,
                              info,
                              description,
                              'onlysave',
                              (event: any) => {
                                const percentCompleted = Math.round((event.loaded * 100) / event.total)
                                setPercentage(percentCompleted);
                              }
                            )
                            .then(() => {
                              setFormSaved(true);
                              setSubmitting(false);
                              setLoading(false);
                            })
                            .catch((err: AxiosError) => {
                              console.log('AddDescription: send:', err);
                              setSubmitting(false);
                              setLoading(false);
                              showAlert(
                                'Lo sentimos',
                                'Ha ocurrido un error desconocido',
                              );
                            });
                          }
                          setStep({
                            ...step,
                            type: 'payment',
                            procedures,
                            extraPhotos,
                            mandatoryPhotos,
                            referencePhotos,
                            info,
                            description,
                          });
                        }}
                      />
                    </>
                  );
                case 'payment':
                  return (
                    <>
                      <TabBar
                        leftTab={{
                          label: 'Verificar',
                          onPress: (): void => {
                            setStep({
                              ...step,
                              type: 'verified',
                            });
                          },
                        }}
                        centerTab={{
                          label: 'Pago',
                        }}
                      />
                      <Payment
                        loading={submitting}
                        procedures={step.procedures}
                        extraPhotos={step.extraPhotos}
                        mandatoryPhotos={step.mandatoryPhotos}
                        referencePhotos={step.referencePhotos}
                        info={step.info}
                        description={step.description}
                        onSubmit={(
                          procedures,
                          photos,
                          referencePhotos,
                          {
                            description,
                            medicines,
                            previous_procedures,
                            birthdate,
                            allergies,
                            gender,
                            diseases,
                          },
                          {
                            weight,
                            weight_unit_id,
                            height,
                            height_unit_id,
                            hip_measurement,
                            waist_measurement,
                            bust_size,
                          },
                          payment,
                          payment_code,
                          successful,
                          error,
                        ): void => {
                          if (successful) {
                            setLoading(true);
                            EvaluationsService.create(
                              user.id,
                              procedures,
                              photos,
                              referencePhotos,
                              {
                                weight,
                                weight_unit_id,
                                height,
                                height_unit_id,
                                hip_measurement,
                                waist_measurement,
                                bust_size,
                              },
                              {
                                description,
                                medicines,
                                previous_procedures,
                                birthdate,
                                allergies,
                                gender,
                                diseases,
                              },
                              'onlypayment',
                              (event: any) => {
                                const percentCompleted = Math.round((event.loaded * 100) / event.total)
                                setPercentage(percentCompleted);
                              },
                              payment,
                              payment_code,
                            )
                              .then(() => {
                                setSubmitting(false);
                                setLoading(false);

                                navigation.navigate('EvaluationSent');
                              })
                              .catch((err: AxiosError) => {
                                console.log('AddDescription: send:', err);
                                setSubmitting(false);
                                setLoading(false);
                                showAlert(
                                  'Lo sentimos',
                                  'Ha ocurrido un error desconocido',
                                );
                              });
                          } else {
                            showAlert(
                              'Lo sentimos',
                              error ?? 'Algo ha ocurrido al procesar su pago',
                            );
                            EvaluationsService.storeFailedPayment(payment);
                            setSubmitting(false);
                          }
                        }}
                      />
                    </>
                  );

                default:
                  exhaustiveCheck(step);
              }
            })()}
          </View>
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};
