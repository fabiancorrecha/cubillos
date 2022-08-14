import React from 'react';
import { Header } from 'widgets';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Icons } from 'assets';
import { ChatService } from 'services/admin';
import { connect } from 'react-redux';
import LoadingContainer from 'widgets/loading-container';
import { SafeAreaView, FlatList, TouchableWithoutFeedback, ActivityIndicator, Image, View, StyleSheet, Text } from 'react-native';
import Colors from 'utils/colors';
import Button from 'widgets/button';
import { Styles } from 'utils';
import { Label } from 'widgets';
import moment from 'moment';
import { socket } from 'services/socket';
import { on, emit } from 'jetemit';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
  user: any;
}

class Chat extends React.Component<Props> {

	state = {
		data: [],
		page: 1,
		last_page: 1,
		isLoadingMore: false,
		loading: true,
		subscriber: () => null
	}

	componentDidMount() {
		this.load();

		socket.on('chat/message', async (message: any) => {
			let chats: any = [...this.state.data];
			const index: number = chats.findIndex((i: any) => i.id == message.chat_id);
			chats[index].messages_count++;
			chats[index].updated_at = message.created_at;
			await this.setState({
				chats
			});
		});

		socket.on('patients/user-delete', (_data: any) => {
			let data: any = [...this.state.data];
			data = data.filter((i: any) => i.users.map((i: any) => i.id).indexOf(_data) == -1);
			this.setState({
				data
			});
			emit('patients/user-delete',_data);
		});

		this.setState({
			subscriber: on('chats/viewed',(message: any) => {
				const data: any = [...this.state.data];
				const index: number = data.findIndex((i: any) => i.id == message.chatId);
				if (index != -1) {
					let chat: any = data[index];
					chat.messages_count = 0;
					chat.updated_at = message.date;
					this.setState({
						data
					});
				}
			})
		});
	}

	componentWillUnmount() {
		socket.off('chat/message');
		socket.off('patients/user-delete');
		this.state.subscriber();
	}

	load = async () => {	
		const res: any = await ChatService.get({ 
			id: this.props.user.id,
			paginate: true
		});
		this.setState({
			data: [...this.state.data, ...res.chats.data],
			last_page: res.chats.last_page,
			loading: false
		});
	}

	renderFooter = () => {
	    const { isLoadingMore, last_page, page } = this.state;

	    if (isLoadingMore) {
	      return (
	        <ActivityIndicator
	          color={ Colors.yellow }
	          style={ styles.activityIndicator }
	        />
	      );
	    }

	    if (last_page > page) {
	      return (
	        <Button
	          onPress={ async () => {
	          	await this.setState({
	          		page: this.state.page + 1,
	          		isLoadingMore: true
	          	});
	          	this.load();
	          } }
	          style={ styles.button }
	          textBold
	          title="Cargar más"
	          titleStyle={ styles.buttonTitle }
	        />
	      );
	    }

	    return null;
	}

	view = async (chat: any) => {
		const data: any = [...this.state.data];
		const index: number = data.findIndex((i: any) => i.id == chat.id);
		if (index != -1) {
			let chat: any = data[index];
			chat.messages_count = 0;
			await this.setState({
				data
			});
		}
		const user: any = chat.users.find((i: any) => i.level == 3);
		this.props.navigation.navigate('ViewChat',{
			name: this.getUserName(chat.users),
			chatId: chat.id,
			user_id: user.id
		});
	}

	getUserName = (users: any) => {
		if (this.props.user.level == 3) {
			return "Dr. Carlos Ramos";
		}
		else {
			const user: any = users.find((i: any) => i.level == 3);
			return user.person.name + ' ' + user.person.lastname;
		}
	}

	render() {
		const { navigation } = this.props;

		return (
	      <SafeAreaView style={ { flex: 1 } }>
	      	<Header
	      	  backIcon={ Icons.home }
	          title="Chat"
	          icon={ Icons.menu.AdminChat }
	          navigation={ navigation }
	        />
	        <LoadingContainer loading={ this.state.loading }>
	        	<FlatList
	        	  ListEmptyComponent={
	        	  	<Text style={ { textAlign: 'center', fontSize: 16 } }>No hay chats disponibles</Text>
	        	  }
				  contentContainerStyle={ styles.padding }
		          data={ this.state.data }
		          keyExtractor={ (item: any) => item.id.toString() }
		          ListFooterComponent={ this.renderFooter }
		          renderItem={ ({ item: i }) => {
		          	return (
						<TouchableWithoutFeedback onPress={ () => this.view(i) }>
			          		<View style={ styles.item }>
			          			<View style={ { flex: .3, alignItems: 'center', justifyContent: 'center' } }>
			          				<Image style={ styles.icon } source={ Icons.menu.AdminChat } />
			          			</View>
			          			<View style={ { flex: .6 } }>
			          				<Text numberOfLines={ 1 } style={ { fontWeight: 'bold' } }>{ this.getUserName(i.users) }</Text>
			          				<Text numberOfLines={ 1 }>{ moment(i.updated_at || i.created_at).format('DD/MM/YYYY HH:mm') }</Text>
								</View>
								<View style={ { justifyContent: 'center' } }>
									{ i.messages_count > 0 && (
										<Text style={ styles.badge }>
											{ i.messages_count }
										</Text>
									) }
								</View>						
							</View>
			          	</TouchableWithoutFeedback>
		          	)		          	
		          } }
		        />
	        </LoadingContainer>
		  </SafeAreaView>
		)
	}
}

const styles = StyleSheet.create({
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
	activityIndicator: {
	    paddingVertical: 24,
	    paddingHorizontal: 16,
	},
	padding: {
		padding: 20
	},
	item: {
		backgroundColor: Colors.gray,
		borderRadius: 5,
		marginVertical: 5,
		padding: 10,
		flexDirection: 'row',
		...Styles.shadow
	},
	icon: {
		resizeMode: 'contain',
		width: 40,
		height: 40,
		tintColor: Colors.black
	},
	badge: {
		backgroundColor: Colors.red,
		height: 20,
		width: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		color: Colors.white,
		textAlign: 'center',
		alignSelf: 'flex-end'
	}
});

export default connect((state: any) => {
	return  {
		user: state.user
	}	
})(Chat);