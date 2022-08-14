import {setChatId} from 'actions/chat-id';
import {addMessage, setMessages} from 'actions/messages';
import {Icons, Images} from 'assets';
import {AxiosError} from 'axios';
import {Message} from 'models/message';
import {User} from 'models/user';
import moment from 'moment';
import { urlRegex } from 'utils/url'
import React, {ReactElement, useCallback, useState} from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Linking
} from 'react-native';
import Toast from 'react-native-root-toast';
import {useFocusEffect, useNavigation} from 'react-navigation-hooks';
import {NavigationStackScreenComponent} from 'react-navigation-stack';
import {useTypedSelector} from 'reducers';
import {MessagesService} from 'services/messages-service';
import {useTypedDispatch} from 'store';
import {prop} from 'utils';
import Colors from 'utils/colors';
import {Text, TextInput} from 'widgets';

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: Colors.blue,
    flexDirection: 'row',
  },
  headerButton: {
    paddingVertical: 8,
    paddingStart: 16,
  },
  headerButtonImage: {
    height: 24,
    width: 24,
  },
  headerUserImage: {
    backgroundColor: 'white',
    borderRadius: 100,
    margin: 8,
    height: 48,
    width: 48,
  },
  headerUserName: {
    color: 'white',
  },

  messageListContent: {
    padding: 16,
  },
  messageListItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '80%',
  },
  messageListItemMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#e0e0e0',
    borderTopStartRadius: 8,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  messageListItemTheirs: {
    borderTopEndRadius: 8,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#b8bfd2',
  },
  messageListItemText: {
    color: 'black',
  },
  messageListItemDate: {
    fontSize: 12,
    textAlign: 'right',
  },
  messageListItemUser: {
    fontSize: 12,
    textAlign: 'right',
  },

  messageAreaContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray,
    flexDirection: 'row',
    paddingStart: 8,
  },
  messageAreaTextInput: {
    backgroundColor: 'white',
    borderRadius: 100,
    fontSize: 14,
  },
  messageAreaButtonImage: {
    height: 24,
    margin: 12,
    width: 24,
  },
});

export const Chat: NavigationStackScreenComponent = () => {
  const navigation = useNavigation();
  const user = useTypedSelector(prop('user')) as User;
  const chatId = useTypedSelector(prop('chatId'));
  const messages = useTypedSelector(prop('messages'))
    .slice()
    .reverse();
  const dispatch = useTypedDispatch();

  const [messageText, setMessageText] = useState('');

  const goBack = (): void => {
    navigation.goBack();
  };

  const sendMessage = (): void => {
    const pendingMessageText = messageText;
    if (!pendingMessageText) {
      Toast.show('Debe escribir un mensaje');
      return;
    }

    setMessageText('');
    MessagesService.emitSendMessage({
      text: pendingMessageText,
      // eslint-disable-next-line @typescript-eslint/camelcase
      user_id: user.id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      chat_id: chatId,
    });
  };

  const fetchMessages = useCallback(() => {
    MessagesService.show(user.id)
      .then(([chatId, messages, isNew]) => {
        if (isNew) {
          MessagesService.emitRefreshChatList();
        }

        dispatch(setChatId(chatId));
        dispatch(setMessages(messages));
      })
      .catch((err: AxiosError) => {
        Toast.show('No se han podido cargar los mensajes');
        console.log(
          'Chat: fetchMessages: EvaluationsService.getMessages:',
          err,
        );
      });
  }, [dispatch, user.id]);

  useFocusEffect(fetchMessages);

  MessagesService.useSendMessageListener(message => {
    if (message.chatId !== chatId) {
      return;
    }

    dispatch(addMessage(message));

    if (message.user.id === user.id) {
      return;
    }

    MessagesService.sawMessage(message.id).catch((err: AxiosError): void => {
      console.log('Chat: MessagesService.useSendMessageListener:', err);
    });
  });

  const renderMessage = ({item}: ListRenderItemInfo<Message>): ReactElement => {
    item.text = item.text.replace(urlRegex, (url: string) => {
      return '<a>' + url + '<a>';
    });

    const items = item.text.split('<a>');

    return (
      <View
        style={[
          styles.messageListItem,
          item.user.id === user?.id
            ? styles.messageListItemMine
            : styles.messageListItemTheirs,
        ]}>
        <Text style={ styles.messageListItemText }>
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
        <Text style={styles.messageListItemDate}>
          {moment(item.date).format('LT[,] D [de] MMMM [de] YYYY')}
        </Text>
        <Text style={styles.messageListItemUser}>
          {item.user.person.name} {item.user.person.lastName}
        </Text>
      </View>
    );
  };

  const MessageSeparator = (): ReactElement => <View style={{height: 16}} />;

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{height: '100%'}}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={goBack}>
            <Image style={styles.headerButtonImage} source={Icons.back} />
          </TouchableOpacity>
          <Image
            style={styles.headerUserImage}
            source={Images.profilePicture}
          />
          <Text bold style={styles.headerUserName}>
            Dr. Carlos Ramos
          </Text>
        </View>
        <FlatList
          contentContainerStyle={styles.messageListContent}
          data={messages}
          extraData={user}
          inverted
          keyboardShouldPersistTaps="always"
          keyExtractor={({id}): string => id.toString()}
          renderItem={renderMessage}
          ItemSeparatorComponent={MessageSeparator}
        />
        <View style={styles.messageAreaContainer}>
          <TextInput
            containerStyle={{flex: 1}}
            onChangeText={setMessageText}
            placeholder="Escribir mensaje"
            style={styles.messageAreaTextInput}
            value={messageText}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Image style={styles.messageAreaButtonImage} source={Icons.send} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

Chat.navigationOptions = {headerShown: false};
