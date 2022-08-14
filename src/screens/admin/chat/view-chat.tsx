import { setChatId } from 'actions/chat-id';
import { addMessage, setMessages } from 'actions/messages';
import { Icons, Images } from 'assets';
import { AxiosError } from 'axios';
import { Message } from 'models/message';
import { User } from 'models/user';
import moment from 'moment';
import React, { ReactElement, useCallback, useState, useEffect } from 'react';
import { urlRegex } from 'utils/url'
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
import { useFocusEffect, useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import { useTypedSelector } from 'reducers';
import { MessagesService } from 'services/messages-service';
import { useTypedDispatch } from 'store';
import { prop } from 'utils';
import Colors from 'utils/colors';
import { Text, TextInput } from 'widgets';
import { ChatService } from 'services/admin';
import { emit, on } from 'jetemit';

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: Colors.blue,
    flexDirection: 'row',
    paddingVertical: 10
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
    marginLeft: 20
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

export const ViewChat: NavigationStackScreenComponent = () => {
  const navigation = useNavigation();
  const user = useTypedSelector(prop('user')) as User;
  const chatId = useNavigationParam('chatId')
  const name = useNavigationParam('name')
  const user_id: number = useNavigationParam('user_id');
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
      user_id: user.id,
      chat_id: chatId,
    });
  };

  const fetchMessages = useCallback(() => {
    ChatService.messages({
      id: chatId, 
      user_id: user.id
    }).then((res: any) => {
      dispatch(setChatId(chatId));
      dispatch(setMessages(res.chat.messages));
    }).catch((err: AxiosError) => {
      Toast.show('No se han podido cargar los mensajes');
      console.log(err);
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
  
    emit('chats/viewed', message);
    MessagesService.sawMessage(message.id).catch((err: AxiosError): void =>
     console.log(err),
    );
  });

  const renderMessage = ({ item }: ListRenderItemInfo<Message>): ReactElement => {
    item.text = item.text.replace(urlRegex, (url: string) => {
      return '<a>' + url + '<a>';
    });

    const items = item.text.split('<a>');

    return (
      <View
        style={ [
          styles.messageListItem,
          item.user.level < 3
            ? styles.messageListItemMine
            : styles.messageListItemTheirs,
        ] }>
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
        <Text style={ styles.messageListItemDate }>
          { moment(item.date).format('LT[,] D [de] MMMM [de] YYYY') }
        </Text>
        <Text style={ styles.messageListItemDate }>
          { item.user.person.name } { item.user.person.lastname }
        </Text>
      </View>
    );
  };

  const MessageSeparator = (): ReactElement => <View style={ { height: 16 } } />;

  useEffect(() => {
    const subscriber = on('patients/user-delete', (data: any) => {
      if (data == user_id) {
        goBack();
        Toast.show("Lo sentimos, el usuario ha sido eliminado");
      }
    });

    return (): void => {
      subscriber();
    };
  }, []);

  return (
    <SafeAreaView style={ { flex: 1 } }>
      <View style={ { height: '100%' } }>
        <View style={ styles.header }>
          <TouchableOpacity style={ styles.headerButton } onPress={ goBack }>
            <Image style={ styles.headerButtonImage } source={ Icons.back } />
          </TouchableOpacity>
          <Text bold style={ styles.headerUserName }>
            { name }
          </Text>
        </View>
        <FlatList
          contentContainerStyle={ styles.messageListContent }
          data={ messages }
          extraData={ user }
          inverted
          keyboardShouldPersistTaps="always"
          keyExtractor={ ({ id }): string => id.toString() }
          renderItem={ renderMessage }
          ItemSeparatorComponent={ MessageSeparator }
        />
        <View style={ styles.messageAreaContainer }>
          <TextInput
            containerStyle={ { flex: 1 } }
            onChangeText={ setMessageText }
            placeholder="Escribir mensaje"
            style={ styles.messageAreaTextInput }
            value={ messageText }
          />
          <TouchableOpacity onPress={ sendMessage }>
            <Image style={ styles.messageAreaButtonImage } source={ Icons.send } />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

ViewChat.navigationOptions = { headerShown: false };
