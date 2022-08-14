import {addMessage, setMessages} from 'actions/evaluation-messages';
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {useKeyboardListener} from 'hooks';
import {emit, on} from 'jetemit';
import {Evaluation} from 'models/evaluation';
import {EvaluationMessage} from 'models/evaluation-message';
import {RawPayment} from 'models/payment';
import {User} from 'models/user';
import { urlRegex } from 'utils/url'
import React, {
  EffectCallback,
  FunctionComponent,
  ReactElement,
  ReactText,
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Keyboard,
  ListRenderItemInfo,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  Linking
} from 'react-native';
import Toast from 'react-native-root-toast';
import {SafeAreaView} from 'react-navigation';
import {
  useFocusEffect,
  useNavigation,
  useNavigationParam,
} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {EvaluationsService, UsersService} from 'services';
import {socket} from 'services/socket';
import {useTypedDispatch} from 'store';
import {formatCurrency, openImagePicker, prop, showAlert, trace} from 'utils';
import {calculateAge} from 'utils/calculate-age';
import Colors from 'utils/colors';
import {OptionsMenu, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import Budgets from './budgets';

const styles = StyleSheet.create({
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
  sectionContainer: {
    padding: 16,
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
  outlineButton: {
    backgroundColor: Colors.blue,
    borderRadius: 56,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  outlineButtonIcon: {
    width: 24,
    height: 24,
    marginEnd: 6,
    tintColor: Colors.yellow,
  },
  outlineButtonTitle: {
    color: 'white',
  },
  messageListContentContainer: {
    padding: 16,
  },
  messageList: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  tabText: {
    color: Colors.blue,
    textAlign: 'center',
  },
  tabItem: {
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
});

const Separator: FunctionComponent = () => <View style={{height: 8}} />;

const Divider: FunctionComponent = () => (
  <View style={{height: 2, backgroundColor: Colors.blue}} />
);

type ButtonProps = {
  icon: ImageSourcePropType;
  title: string;
  onPress: EffectCallback;
};

const OutlineButton: FunctionComponent<ButtonProps> = ({
  icon,
  title,
  onPress,
}: ButtonProps) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.outlineButton}>
      <Image style={styles.outlineButtonIcon} source={icon} />
      <Text bold style={styles.outlineButtonTitle}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

type ItemProps = {
  message: EvaluationMessage;
  isMe: boolean;
  onPress: () => void;
};

const Item = ({
  message: {text, user, createdAt, file},
  isMe,
  onPress,
}: ItemProps): ReactElement => {
  text = text.replace(urlRegex, (url: string) => {
    return '<a>' + url + '<a>';
  });

  const items = text.split('<a>');

  return (
    <View>
      <View
        style={[
          styles.sectionHeaderContainer,
          {flexDirection: isMe ? 'row-reverse' : 'row'},
        ]}>
        <Text style={[styles.sectionHeaderTitle, isMe ? null : {flex: 1}]} bold>
          {isMe ? 'Yo' : `${user.person.name} ${user.person.lastName}`}
        </Text>
        <Text style={[styles.sectionHeaderTitle, isMe ? {flex: 1} : null]}>
          {createdAt}
        </Text>
      </View>
      <View
        style={{
          marginTop: 8,
        }}>
        <Text>
          {
            items.map((i: any) => {
              if (urlRegex.test(i)) {
                return (
                  <Text bold style={ { 
                    color: '#42A5F5'
                  } } 
                  onPress={ () => Linking.openURL(i) }>
                    { i }
                  </Text>
                )
              }
              else {
                return (
                  <React.Fragment>{ i }</React.Fragment>
                )
              }                          
            })
          }
        </Text>
      </View>
      {file && (
        <TouchableOpacity onPress={onPress}>
          <Image
            source={{uri: file}}
            style={{
              width: '100%',
              aspectRatio: 16 / 9,
              borderRadius: 16,
              marginTop: 8,
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  )
};

type MessageListProps = {
  messages: EvaluationMessage[];
  userId: number;
  onPressImage: (image: string) => void;
  contentContainerStyle: StyleProp<ViewStyle>;
};

const MessageList = ({
  messages,
  userId,
  onPressImage,
  contentContainerStyle,
}: MessageListProps): ReactElement => {
  const extractKey = ({id}: EvaluationMessage): string => id.toString();
  const renderMessage = ({
    item,
  }: ListRenderItemInfo<EvaluationMessage>): ReactElement => (
    <Item
      message={item}
      isMe={item.user.id === userId}
      onPress={(): void => onPressImage(item.file as string)}
    />
  );

  const Separator: FunctionComponent = () => <View style={{height: 16}} />;

  return (
    <FlatList
      contentContainerStyle={[
        styles.messageListContentContainer,
        contentContainerStyle,
      ]}
      data={messages}
      inverted
      keyboardShouldPersistTaps="always"
      keyExtractor={extractKey}
      renderItem={renderMessage}
      style={styles.messageList}
      ItemSeparatorComponent={Separator}
    />
  );
};

type BottomBarButtonProps = {
  onPress: EffectCallback;
  icon: ImageSourcePropType;
  tintColor?: string;
  disabled?: boolean;
};

const BottomBarButton = ({
  onPress,
  icon,
  tintColor,
  disabled,
}: BottomBarButtonProps): ReactElement => (
  <TouchableOpacity onPress={onPress} disabled={disabled}>
    <Image
      style={{height: 24, width: 24, margin: 12, tintColor}}
      source={icon}
    />
  </TouchableOpacity>
);

type RowProps = {
  label: string;
  content: ReactText;
};

function Row({label, content}: RowProps) {
  return (
    <Text>
      {label}: {content}
    </Text>
  );
}

export const ViewEvaluation: FunctionComponent = () => {
  const dispatch = useTypedDispatch();
  const {goBack, navigate} = useNavigation();
  const evaluation = useNavigationParam('evaluation') as Evaluation & {
    user: {id: number};
    payment?: RawPayment;
  };
  const messages = useTypedSelector(
    ({evaluationMessages}) =>
      evaluationMessages[evaluation.id]?.slice().reverse() ?? [],
  );
  const user = useTypedSelector(prop('user')) as User;

  const [showInfo, setShowInfo] = useState(true);
  const [error, setError] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [attachmentUri, setAttachmentUri] = useState('');
  const [tab, setTab] = useState(1);
  const [keyboardSpace, setKeyboardSpace] = useState(0);

  const _keyboardDidShow = (e: any) => {
    setKeyboardSpace(e.endCoordinates.height);
  };

  const _keyboardDidHide = (e: any) => {
    setKeyboardSpace(0);
  };

  const sendMessage = (uri: string = ""): void => {
    const _messageText: string = messageText;
    setMessageText('');
    if (!_messageText && !uri && !attachmentUri) {
      Toast.show('Debe escribir un mensaje');
      return;
    }

    EvaluationsService.sendMessage(
      user.id,
      evaluation.id,
      _messageText || "Imagen Adjunta",
      uri,
    )
      .then(newMessage => {
        setAttachmentUri('');
        socket.emit('evaluations/send-message', newMessage);
        dispatch(
          addMessage(evaluation.id, EvaluationMessage.fromRaw(newMessage)),
        );
      })
      .catch((err: AxiosError) => {
        showAlert('Lo sentimos', 'Ha ocurrido un error al enviar el mensaje');
        console.log(err);
      });
  };

  const addAttachment = (): void => {
    openImagePicker()
      .then(uri => {
        setAttachmentUri(uri);
        sendMessage(uri);
      })
      .catch(trace('ViewEvaluation: sendMessage:'));
  };

  useKeyboardListener('keyboardDidShow', () => {
    if (tab != 2) setShowInfo(false);
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      _keyboardDidShow,
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      _keyboardDidHide,
    );
  }, []);

  useEffect(() => {
    const subscriber = on('budgets/create', (data: any) => {
      if (evaluation.id == data.id) {
        evaluation.budgets = data.budgets;
      }
    });

    return (): void => {
      subscriber();
    };
  }, []);

  useEffect(() => {
    const subscriber = on('evaluations/finish', (data: any) => {
      if (evaluation.id == data.id) {
        evaluation.status = 0;
      }
    });

    return (): void => {
      subscriber();
    };
  }, []);

  useEffect(() => {
    if (!evaluation) {
      Alert.alert('Lo sentimos', 'Ha ocurrido un error desconocido');
      goBack(null);
    }
  }, [evaluation, goBack]);

  const fetchMessages = useCallback(() => {
    if (!evaluation) {
      return;
    }

    EvaluationsService.getMessages(user.id, evaluation.id)
      .then(messages => dispatch(setMessages(evaluation.id, messages)))
      .catch((err: AxiosError) => {
        console.log(err);
        setError(true);
      });
  }, [dispatch, evaluation, user.id]);

  useFocusEffect(fetchMessages);

  EvaluationsService.useSendMessageListener(message => {
    if (message.evaluationId !== evaluation.id) {
      return;
    }

    if (message.user.id === user.id) {
      return;
    }

    emit('evaluations/send-message', {
      id: evaluation.id,
    });

    dispatch(addMessage(evaluation.id, message));
    EvaluationsService.sawMessage(message.id).catch((err: AxiosError): void =>
      console.log(err),
    );
  });

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    UsersService.getData(evaluation.user.id)
      .then(data => {
        setLoading(false);
        setData(data);
      })
      .catch(err => {
        console.log('ViewEvaluation: useEffect:', err);
        setLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={{height: '100%', backgroundColor: 'white'}}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButtonContainer, styles.homeButton]}
          onPress={() => navigate('Dashboard')}>
          <Image style={styles.headerButton} source={Icons.home} />
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
      <View
        style={{
          alignItems: 'center',
          backgroundColor: Colors.gray,
          flexDirection: 'row',

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,

          elevation: 4,
        }}>
        <TouchableOpacity
          style={[styles.headerButtonContainer, styles.homeButton]}
          onPress={(): void => {
            goBack();
          }}>
          <Image
            style={[styles.headerButton, {tintColor: Colors.blue}]}
            source={Icons.back}
          />
        </TouchableOpacity>
        <Text
          bold
          style={{
            color: 'black',
            flex: 1,
            textAlign: 'center',
            paddingEnd: 50,
          }}>
          Evaluación
        </Text>
      </View>
      <View style={{flex: showInfo ? 1 : undefined}}>
        {showInfo && (
          <React.Fragment>
            <View style={styles.tabContainer}>
              <View style={{flex: 0.5}}>
                <TouchableOpacity onPress={() => setTab(1)}>
                  <View
                    style={{
                      ...styles.tabItem,
                      backgroundColor: tab == 1 ? Colors.blue : undefined,
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 5,
                    }}>
                    <Text
                      style={{
                        ...styles.tabText,
                        color: tab == 1 ? Colors.white : undefined,
                      }}
                      numberOfLines={1}>
                      Paciente
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{flex: 0.5}}>
                <TouchableOpacity onPress={() => setTab(2)}>
                  <View
                    style={{
                      ...styles.tabItem,
                      backgroundColor: tab == 2 ? Colors.blue : undefined,
                      borderTopRightRadius: 5,
                      borderBottomRightRadius: 5,
                    }}>
                    <Text
                      style={{
                        ...styles.tabText,
                        color: tab == 2 ? Colors.white : undefined,
                      }}
                      numberOfLines={1}>
                      Presupuesto
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={[styles.sectionContainer]}>
              {tab == 1 && (
                <View style={{flex: 1}}>
                  <Text>
                    Operaciones:{' '}
                    {evaluation.procedures.map(prop('name')).join(', ')}
                  </Text>
                  <Separator />
                  <Text>Descripción: {evaluation.description}</Text>
                  <Separator />
                  <Text>Altura: {evaluation.height} m</Text>
                  <Separator />
                  <Text>Peso: {evaluation.weight} kg</Text>
                  <Separator />
                  {evaluation.payment && (
                    <>
                      <Text>
                        Método de pago:{' '}
                        {evaluation.payment.method_id === 1
                          ? 'PayPal'
                          : evaluation.payment.method_id === 2 ? 'ePayco' : 'Stripe'}
                      </Text>
                      <Separator />
                      <Text>
                        Monto: {formatCurrency('$', evaluation.payment.amount)}
                      </Text>
                      <Separator />
                      <Text>Código: {evaluation.payment.response_code}</Text>
                      <Separator />
                    </>
                  )}
                  {evaluation.bust_size && (
                    <React.Fragment>
                      <Text>Tamaño de busto: {evaluation.bust_size} cm</Text>
                      <Separator />
                    </React.Fragment>
                  )}
                  {evaluation.hip_measurement && (
                    <React.Fragment>
                      <Text>
                        Medida de cadera: {evaluation.hip_measurement} cm
                      </Text>
                      <Separator />
                    </React.Fragment>
                  )}
                  {evaluation.waist_measurement && (
                    <React.Fragment>
                      <Text>
                        Tamaño de cintura: {evaluation.waist_measurement} cm
                      </Text>
                      <Separator />
                    </React.Fragment>
                  )}
                  {loading && (
                    <ActivityIndicator
                      style={{padding: 16}}
                      color={Colors.yellow}
                    />
                  )}
                  {!!data && Object.values(data).some(value => !!value) && (
                    <>
                      {!!data.previous_procedures && (
                        <>
                          <Row
                            label="Previas operaciones"
                            content={data.previous_procedures}
                          />
                          <Separator />
                        </>
                      )}
                      {!!data.diseases && (
                        <>
                          <Row label="Enfermedades" content={data.diseases} />
                          <Separator />
                        </>
                      )}
                      {!!data.medicines && (
                        <>
                          <Row label="Medicamentos" content={data.medicines} />
                          <Separator />
                        </>
                      )}
                      {!!data.allergies && (
                        <>
                          <Row label="Alergias" content={data.allergies} />
                          <Separator />
                        </>
                      )}
                      {!!data.birthdate && (
                        <>
                          <Row label="Nacimiento" content={data.birthdate} />
                          <Separator />
                          <Row
                            label="Edad"
                            content={calculateAge(data.birthdate)}
                          />
                          <Separator />
                        </>
                      )}
                      {!!data.gender && (
                        <>
                          <Row label="Género" content={data.gender} />
                          <Separator />
                        </>
                      )}
                    </>
                  )}
                  <View style={{alignItems: 'center', paddingTop: 8}}>
                    <OutlineButton
                      title="Ver fotos actuales"
                      icon={Icons.view}
                      onPress={(): void => {
                        navigate('ViewImages', {
                          images: evaluation.photos.map((i: any) => i.file_url),
                          title: 'Fotos actuales',
                        });
                      }}
                    />
                    {evaluation.referencePhotos.length > 0 && (
                      <React.Fragment>
                        <Separator />
                        <OutlineButton
                          title="Más fotos (opcional)"
                          icon={Icons.view}
                          onPress={(): void => {
                            navigate('ViewImages', {
                              images: evaluation.referencePhotos.map(
                                (i: any) => i.file_url,
                              ),
                              title: 'Más fotos',
                            });
                          }}
                        />
                      </React.Fragment>
                    )}
                  </View>
                </View>
              )}

              {tab == 2 && (
                <Budgets
                  currencies={useNavigationParam('currencies')}
                  procedures={useNavigationParam('procedures')}
                  evaluation={useNavigationParam('evaluation')}
                />
              )}
            </ScrollView>
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }}
            />
          </React.Fragment>
        )}
        <Button
          title={showInfo ? 'Mostrar chat' : 'Ocultar chat'}
          style={{
            alignSelf: 'center',
            backgroundColor: Colors.yellow,
            borderRadius: 100,
            paddingVertical: 8,
            marginVertical: 10,
            paddingHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          titleStyle={{
            color: 'black',
          }}
          textBold
          onPress={(): void => {
            setShowInfo(!showInfo);

            if (!showInfo) {
              Keyboard.dismiss();
            }
          }}
        />
      </View>
      {!showInfo && (
        <>
          <Divider />
          {error ? (
            <View style={{padding: 16, alignItems: 'center'}}>
              <Text>Ha ocurrido un error al cargar los mensajes</Text>
            </View>
          ) : (
            <React.Fragment>
              <View style={{flex: 1}}>
                <MessageList
                  messages={messages as EvaluationMessage[]}
                  userId={user.id}
                  contentContainerStyle={{
                    paddingTop: evaluation.budget ? 48 : undefined,
                  }}
                  onPressImage={(image: string): void => {
                    navigate('ViewImage', {image});
                  }}
                />
              </View>
              <View
                style={{
                  backgroundColor: Colors.gray,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <BottomBarButton
                  tintColor={attachmentUri ? 'green' : undefined}
                  icon={Icons.attachment}
                  onPress={addAttachment}
                  disabled={evaluation.status == 0}
                />
                <TextInput
                  containerStyle={{flex: 1}}
                  editable={!evaluation.closed && evaluation.status != 0}
                  onChangeText={setMessageText}
                  placeholder={
                    evaluation.closed
                      ? 'Evaluación finalizada'
                      : 'Escribir mensaje'
                  }
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 100,
                    fontSize: 14,
                  }}
                  value={messageText}
                />
                <BottomBarButton
                  disabled={evaluation.status == 0}
                  icon={Icons.send}
                  onPress={() => sendMessage()}
                />
              </View>
            </React.Fragment>
          )}
        </>
      )}
    </SafeAreaView>
  );
};
