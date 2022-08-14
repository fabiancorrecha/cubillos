import React from 'react';
import { SafeAreaView, ActivityIndicator, View, Text, StyleSheet, FlatList, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { EvaluationService } from 'services/admin';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import LoadingContainer from 'widgets/loading-container';
import { Styles } from 'utils';
import { Label, Header, TextInput, Picker } from 'widgets';
import Colors from 'utils/colors';
import moment from 'moment';
import { Icons } from 'assets';
import { ProcedureService, CurrencyService } from 'services/admin';
import { on } from 'jetemit';
import Button from 'widgets/button';
import { connect } from 'react-redux';
import { socket } from 'services/socket';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
  user: any;
}

class Evaluations extends React.Component<Props> {

	state = {
		form: {
			search: '',
			status: {
				label: 'Todos',
				value: -1
			}
		},
		page: 1,
		last_page: 1,
		data: [],
		loading: true,
		status: [
			{ value: -1, label: "Todos" },
			{ value: 1, label: "Activo" },
			{ value: 0, label: "Inactivo" }
		],
		currencies: [],
		procedures: [],
		subscriber: () => null,
		subscriberFinish: () => null,
		subscriberMessage: () => null,
		isLoadingMore: false
	}

	componentDidMount() {
		this.load();
		this.loadData();

		this.setState({
			subscriber: on('budgets/create',(_data: any) => {
				const index: number = this.state.data.findIndex((i: any) => i.id == _data.id);
				if (index != -1) {
					const data: any = [ ...this.state.data ];
					data[index].budgets = _data.budgets;
					this.setState({
						data
					});
				}
			}),
			subscriberFinish: on('evaluations/finish',(_data: any) => {
				const index: number = this.state.data.findIndex((i: any) => i.id == _data.id);
				if (index != -1) {
					const data: any = [ ...this.state.data ];
					data[index] = _data;
					this.setState({
						data
					});
				}
			}),
			subscriberMessage: on('evaluations/send-message',(_data: any) => {
				const index: number = this.state.data.findIndex((i: any) => i.id == _data.id);
				if (index != -1) {
					let data: any = [ ...this.state.data ];
					data[index].badge = 0;
					data[index].messages.map((i: any) => {
						i.view = 1;
						return i;
					});
					this.setState({
						data
					});
				}
			})
		});

		socket.on('evaluations/send-message',this.newMessage);
	}

	newMessage = (_data: any) => {
		if (_data.user_id != this.props.user.id) {
			const data: any = [...this.state.data];
			const index = data.findIndex((i: any) => i.id == _data.evaluation_id);
			if (index != -1) {						
				data[index].badge = _data.badge;
				this.setState({
					data
				});
			}	
		}							
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

	componentWillUnmount() {
		this.state.subscriber();
		this.state.subscriberFinish();
		this.state.subscriberMessage();
		socket.off('evaluations/send-message',this.newMessage);
	}

	loadData = async () => {
		const params = {
			withoutLoading: true,
			all: true
		}
		const res: any = await Promise.all([
			CurrencyService.get(params),
			ProcedureService.get(params)
		])
		this.setState({
			currencies: res[0].currencies,
			procedures: res[1].procedures
		});
	}

	load = async () => {
		let form: any = { ...this.state.form };
		form.status = form.status.value;
		const params: any = {
			...form,
			page: this.state.page
		}
		const res: any = await EvaluationService.get(params);
		this.setState({
			data: [...this.state.data, ...res.evaluations.data],
			last_page: res.evaluations.last_page,
			loading: false,
			isLoadingMore: false
		});
	}

	view = async (evaluation: any, index: number) => {
		evaluation.referencePhotos = evaluation.references;
		let data: any = [ ...this.state.data ];
		data[index].badge = 0;
		data[index].messages.map((i: any) => {
			i.view = 1;
			return i;
		});
		await this.setState({
			data
		});
		this.props.navigation.navigate('ViewEvaluation',{
			evaluation,
			procedures: this.state.procedures,
			currencies: this.state.currencies
		});	
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	render() {
		const { navigation } = this.props;

		return (
			<SafeAreaView style={ { flex: 1 } }>
		      	<Header
		          backIcon={ Icons.home }
		          title="Asesoría online"
		          icon={ Icons.menu.AdminEvaluation }
		          navigation={ navigation }
		        />
				<LoadingContainer loading={ this.state.loading }>
					<View style={ styles.searchContainer }>
						<View style={ { flex: .5, paddingRight: 5 } }>
							<TextInput
				              onChangeText={ (e: any) => this.change(e,'search') }
				              placeholder="Buscar"
				              value={ this.state.form.search }
				            />
				        </View>
				        <View style={ { flex: .5, paddingLeft: 5 } }>
							<Picker
				              displayValue={ this.state.form.status.label }
				              onValueChange={ (e: any) => {
				              	const value = this.state.status.find((i: any) => i.value == e);
				              	this.change(value,'status');
				              } }
				              selectedValue={ this.state.form.status.value }>
				              { this.state.status.map(({value, label}) => (
				                <Picker.Item
				                  key={ value.toString() }
				                  value={ value }
				                  label={ label }
				                />
				              )) }
				            </Picker>
				        </View>
			        </View>
			        <View style={ { alignItems: 'center' } }>
						<TouchableOpacity onPress={ async () => {
							await this.setState({
								page: 1,
								loading: true,
								data: []
							});
							this.load();
						} }>
							<View style={ styles.searchButton }>
								<Text style={ styles.searchText }>Buscar</Text>
							</View>
						</TouchableOpacity>
			        </View>

					<FlatList
					  contentContainerStyle={ styles.padding }
			          data={ this.state.data }
			          keyExtractor={ (item: any) => item.id.toString() }
			          ListFooterComponent={ this.renderFooter }
			          ListEmptyComponent={
		        	  	<Text style={ { textAlign: 'center', fontSize: 16 } }>No hay asesorías online disponibles</Text>
		        	  }
			          renderItem={ ({ item: i, index }) => {
			          	const messageCount = i.badge || i.messages.filter((i: any) => i.view == 0 && i.user_id != this.props.user.id).length;
			          	return (
							<TouchableWithoutFeedback onPress={ () => this.view(i, index) }>
				          		<View style={ styles.item }>
				          			<View style={ { flex: .3, alignItems: 'center', justifyContent: 'center' } }>
				          				<Image style={ { ...styles.icon, tintColor: i.status == 1 ? Colors.yellow : Colors.blue } } source={ Icons.evaluationCheck } />
				          			</View>
				          			<View style={ { flex: .6 } }>
				          				<Label numberOfLines={ 1 } label="Paciente">{ i.user.person.name + ' ' + i.user.person.lastname  }</Label>
										<Label label="Presupuesto">
											<Image source={ i.budgets && i.budgets.length > 0 ? Icons.check : Icons.close } style={ i.budgets && i.budgets.length > 0 ? styles.check : styles.close }  />
										</Label>									
										<Label label="Fecha">{ moment(i.created_at).format('DD/MM/YYYY HH:mm') }</Label>
										<Label label="Estatus">{ i.status == 1 ? 'Activo' : 'Inactivo' }</Label>
									</View>	
									<View style={ { justifyContent: 'center' } }>
										<Image
											style={ styles.itemIcon }
											source={ messageCount > 0 ? Icons.message : Icons.messageSeen } />
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
	item: {
		backgroundColor: Colors.gray,
		borderRadius: 5,
		marginVertical: 5,
		padding: 10,
		flexDirection: 'row',
		...Styles.shadow
	},
	check: {
		tintColor: Colors.green,
		resizeMode: 'contain',
		width: 15,
		height: 15
	},
	close: {
		tintColor: Colors.red,
		resizeMode: 'contain',
		width: 10,
		height: 10
	},
	icon: {
		resizeMode: 'contain',
		width: 40,
		height: 40
	},
	padding: {
		padding: 20
	},
	item_procedure: {
		color: Colors.black,
		fontSize: 11
	},
	point: {
		width: 5,
		height: 5,
		backgroundColor: Colors.black,
		borderRadius: 2.5,
		marginRight: 10
	},
	containerItem: {
		flexDirection: 'row',
		paddingLeft: 10,
		alignItems: 'center',
		marginVertical: 3
	},
	bold: {
		fontWeight: 'bold',
		color: Colors.black,
		fontSize: 12
	},
	searchContainer: {
		flexDirection: 'row',
		paddingHorizontal: 20
	},
	searchButton: {
		backgroundColor: Colors.blue,
		borderRadius: 5,
		padding: 5,
		marginTop: 10,
		width: 100,
		marginBottom: 10
	},
	searchText: {
		color: Colors.white,
		textAlign: 'center'
	},
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
	itemIcon: {
	    width: 20,
	    height: 20,
	}
});

export default connect((state: any) => {
	return {
		user: state.user
	}
})(Evaluations);