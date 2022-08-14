import {addMessage, setMessages} from 'actions/evaluation-messages';
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {useKeyboardListener, useSocketEvent} from 'hooks';
import {Evaluation} from 'models/evaluation';
import {EvaluationMessage} from 'models/evaluation-message';
import {User} from 'models/user';
import {Budget} from 'models/budget';
import React, {
  EffectCallback,
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  Keyboard,
  ListRenderItemInfo,
  Modal,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {SafeAreaView} from 'react-navigation';
import {
  useFocusEffect,
  useNavigation,
  useNavigationParam,
} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {EvaluationsService} from 'services';
import {socket} from 'services/socket';
import {useTypedDispatch} from 'store';
import {
  formatCurrency,
  openImagePicker,
  prop,
  showAlert,
  trace,
  DownloadFile,
} from 'utils';
import {default as Colors, default as colors} from 'utils/colors';
import {OptionsMenu, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import FileViewer from 'react-native-file-viewer';
import {BudgetService} from 'services/admin';
import { urlRegex } from 'utils/url'

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
  searchButton: {
    backgroundColor: Colors.blue,
    borderRadius: 5,
    padding: 5,
    marginTop: 10,
    width: 100,
    marginBottom: 10,
  },
  searchText: {
    color: Colors.white,
    textAlign: 'center',
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

const generate = async (budget: any) => {
  if (Platform.OS == 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      continuePrint(budget);
    }
  } else {
    continuePrint(budget);
  }
};

const continuePrint = async (budget: any) => {
  const res: any = await BudgetService.print({
    id: budget.id,
  });
  const path = await DownloadFile.download(res.url);
  if (Platform.OS == 'ios') {
    Linking.openURL(path.path()).catch(err => {
      console.log(err);
    });
  } else {
    FileViewer.open(path.path(), {
      showOpenWithDialog: true,
    })
      .catch((err: any) => console.log(err))
      .finally(async () => {
        await BudgetService.deletePrint({
          name: res.name,
        });
      });
  }
};

export const ViewEvaluation: FunctionComponent = () => {
  const dispatch = useTypedDispatch();
  const {goBack, navigate, setParams} = useNavigation();
  const evaluation = useNavigationParam('evaluation') as Evaluation;
  const messages = useTypedSelector(
    ({evaluationMessages}) =>
      evaluationMessages[evaluation.id]?.slice().reverse() ?? [],
  );
  const user = useTypedSelector(prop('user')) as User;

  const [showInfo, setShowInfo] = useState(true);
  const [error, setError] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [attachmentUri, setAttachmentUri] = useState('');

  const [showBudget, setShowBudget] = useState(false);

  const sendMessage = (uri: string = ""): void => {
    if (evaluation.closed) {
      return;
    }

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
        console.log('ViewEvaluation: sendMessage:', err);
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
    setShowInfo(false);
  });

  useEffect(() => {
    if (!evaluation) {
      console.warn(
        'Attempted to open ViewEvaluation without required navigation params ' +
          '({ evaluation: Evaluation }).',
      );
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
        console.log(
          'ViewEvaluation: useEffect: EvaluationsService.getMessages:',
          err,
        );
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

    dispatch(addMessage(evaluation.id, message));
    EvaluationsService.sawMessage(message.id).catch((err: AxiosError): void => {
      console.log(
        'ViewEvaluation: EvaluationsService.useSendMessageListener:',
        err,
      );
    });
  });

  useSocketEvent('evaluations/budget', (_evaluation: any): void => {
    if (_evaluation.id === evaluation.id) {
      setParams({
        evaluation: {
          ...evaluation,
          budget: Budget.fromRaw(_evaluation.budgets[0]),
        },
      });
    }
  });

  useSocketEvent<{id: number}>('evaluations/finish', ({id}): void => {
    if (id === evaluation.id) {
      setParams({
        evaluation: {...evaluation, closed: true},
      });
    }
  });

  return (
    <SafeAreaView style={{height: '100%', backgroundColor: 'white'}}>
      <Modal
        animationType="fade"
        transparent
        visible={showBudget}
        onRequestClose={(): void => {
          setShowBudget(false);
        }}>
        <TouchableWithoutFeedback
          onPress={(): void => {
            setShowBudget(false);
          }}>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 24,
                width: '80%',
              }}>
              <Text
                style={{
                  color: colors.blue,
                  paddingBottom: 4,
                  textAlign: 'center',
                }}
                bold>
                Recibió un presupuesto
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.yellow,
                  marginVertical: 4,
                }}
              />
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{color: colors.blue, paddingBottom: 4, flex: 1}}
                  bold>
                  Monto
                </Text>
                <Text style={{color: colors.blue, paddingBottom: 4}} bold>
                  {formatCurrency('$', evaluation.budget?.amount ?? 0)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => generate(evaluation.budget)}>
                <View
                  style={{
                    ...styles.searchButton,
                    width: '100%',
                    alignSelf: 'center',
                  }}>
                  <Text style={styles.searchText}>Generar Formato</Text>
                </View>
              </TouchableOpacity>
              {evaluation.procedures.map(({id, name}) => (
                <View key={id} style={{paddingBottom: 4}}>
                  <Text>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={styles.header}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={[styles.headerButtonContainer, styles.homeButton]}
          onPress={(): void => {
            navigate('Dashboard');
          }}>
          <Image style={styles.headerButton} source={Icons.home} />
        </TouchableOpacity>

        {/* OPTIONS BUTTON */}
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
            paddingEnd: 56,
          }}>
          Evaluación
        </Text>
      </View>
      <View style={{flex: showInfo ? 1 : undefined}}>
        {showInfo && (
          <>
            <ScrollView contentContainerStyle={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={[styles.sectionHeaderTitle, {flex: 1}]} bold>
                  Cliente
                </Text>
                <Text>{evaluation.createdAt}</Text>
              </View>
              <Separator />
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
              {evaluation.bust_size && (
                <React.Fragment>
                  <Text>Tamaño de busto: {evaluation.bust_size} cm</Text>
                  <Separator />
                </React.Fragment>
              )}
              {evaluation.hip_measurement && (
                <React.Fragment>
                  <Text>Medida de cadera: {evaluation.hip_measurement} cm</Text>
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
              <View style={{alignItems: 'center', paddingTop: 8}}>
                <OutlineButton
                  title="Ver fotos actuales"
                  icon={Icons.view}
                  onPress={(): void => {
                    navigate('ViewImages', {
                      images: evaluation.photos,
                      title: 'Fotos actuales',
                    });
                  }}
                />
                {evaluation.referencePhotos.length > 0 && (
                  <>
                    <Separator />
                    <OutlineButton
                      title="Más fotos (opcional)"
                      icon={Icons.view}
                      onPress={(): void => {
                        navigate('ViewImages', {
                          images: evaluation.referencePhotos,
                          title: 'Más fotos',
                        });
                      }}
                    />
                  </>
                )}
              </View>
            </ScrollView>
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }}
            />
          </>
        )}
        <Button
          title={showInfo ? 'Mostrar chat' : 'Ocultar chat'}
          textBold
          style={{
            alignSelf: 'center',
            backgroundColor: Colors.yellow,
            borderRadius: 100,
            marginVertical: 12,
            paddingVertical: 8,
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
            <>
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
                {evaluation.budget && (
                  <View
                    style={{
                      bottom: 0,
                      left: 0,
                      right: 0,
                      position: 'absolute',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={(): void => {
                        setShowBudget(true);
                      }}
                      style={{
                        paddingHorizontal: 24,
                        backgroundColor: colors.blue,
                        borderTopStartRadius: 24,
                        height: 36,
                        justifyContent: 'center',
                        borderTopEndRadius: 24,
                      }}>
                      <Text bold style={{color: colors.white}}>
                        Recibió un presupuesto
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
                  disabled={evaluation.closed}
                />
                <TextInput
                  containerStyle={{flex: 1}}
                  editable={!evaluation.closed}
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
                  icon={Icons.send}
                  onPress={() => sendMessage()}
                  disabled={evaluation.closed}
                />
              </View>
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
};
