import React from 'react';
import { Header } from 'widgets';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Icons } from 'assets';
import { ModeratorService, CountryService } from 'services/admin';
import LoadingContainer from 'widgets/loading-container';
import { SafeAreaView, Alert, StyleSheet, View, FlatList, TouchableWithoutFeedback, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker, TextInput, Label, OptionsMenu } from 'widgets';
import moment from 'moment';
import Colors from 'utils/colors';
import { Styles } from 'utils';
import Button from 'widgets/button';
import { socket } from 'services/socket';
import Toast from 'react-native-root-toast';
import { on } from 'jetemit';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class Moderators extends React.Component<Props> {

	state = {
		permissions: [],
		countries: [],
		page: 1,
		last_page: 1,
		data: [],
		form: {
			search: '',
			country: {
				value: 0,
				label: 'Todos'
			},
			status: {
				value: -1,
				label: 'Todos'
			}
		},
		status: [
			{ value: -1, label: 'Todos' },
			{ value: 1, label: 'Activos' },
			{ value: 0, label: 'Inactivos' }
		],
		loading: true,
		isLoadingMore: false,
		countriesRaw: [],
		subscriber: () => null
	}

	async componentDidMount() {
		await this.getData();
		this.load();

		this.setState({
			subscriber: on('moderators/edit',(_data: any) => {
				let data: any = [...this.state.data];
				const index: number = data.findIndex((i: any) => i.id == _data.id);
				if (index != -1) {
					data[index] = _data;
					this.setState({
						data
					});
				}
			})
		});
	}

	componentWillUnmount() {
		this.state.subscriber();
	}

	getData = async () => {
		const res: any = await Promise.all([
			CountryService.get({
				withoutLoading: true,
			}),
			ModeratorService.getPermissions({
				withoutLoading: true,
			})
		])
		this.setState({
			countriesRaw: res[0].countries,
			countries: [
				{
					value: 0,
					label: 'Todos',
				},
				...res[0].countries.map((i: any) => {
					return {
						value: i.id,
						label: i.name
					}
				})
			],
			permissions: res[1].permissions
		});
	}

	load = async () => {
		const params = {
			page: this.state.page,
			search: this.state.form.search,
			country: this.state.form.country.value,
			status: this.state.form.status.value
		}
		const res: any = await ModeratorService.get(params);
		this.setState({
			data: [...this.state.data, ...res.moderators.data],
			last_page: res.moderators.last_page,
			loading: false,
			isLoadingMore: false
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

	changeStatus = (item: any,action: string,index: number) => {
		Alert.alert(
		  "Confirmar",
		  `¿Desea ${ action.toLowerCase() } al moderador?`,
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await ModeratorService.changeStatus({
					id: item.id,
					status: item.status == 1 ? 0 : 1
				});
				let data: any = [...this.state.data];
				data[index].status = item.status == 1 ? 0 : 1;
				this.setState({
					data
				});
				Toast.show("Se ha cambiado el estatus correctamente");
				if (item.status == 1)
					socket.emit('patients/user-disable',item.id);
		    }},
		    {
		      text: 'Cancelar'
		    }
		  ],
		  { cancelable: false },
		);
	}

	delete = (item: any,index: number) => {
		Alert.alert(
		  "Confirmar",
		  '¿Desea eliminar el moderador?',
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await ModeratorService.delete({
					id: item.id
				});
				let data: any = [...this.state.data];
				data.splice(index,1);
				this.setState({
					data
				});
				Toast.show("Se ha eliminado el moderador");
				socket.emit('patients/user-delete',item.id);
		    }},
		    {
		      text: 'Cancelar'
		    }
		  ],
		  { cancelable: false },
		);
	}

	render() {
		const { navigation } = this.props;

		return (
	      <SafeAreaView style={ { flex: 1 } }>
	      	<Header
	      	  backIcon={ Icons.home }
	          title="Moderadores"
	          icon={ Icons.menu.AdminModerators }
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
			              displayValue={ this.state.form.country.label }
			              onValueChange={ (e: any) => {
			              	const value = this.state.countries.find((i: any) => i.value == e);
			              	this.change(value,'country');
			              } }
			              selectedValue={ this.state.form.country.value }>
			              { this.state.countries.map((i: any) => (
			                <Picker.Item
			                  key={ i.value.toString() }
			                  value={ i.value }
			                  label={ i.label }
			                />
			              )) }
			            </Picker>
			        </View>
		        </View>
		        <View style={ styles.searchContainer }>
		        	<View style={ { flex: .5 } }>
		        		<Picker
			              displayValue={ this.state.form.status.label }
			              onValueChange={ (e: any) => {
			              	const value = this.state.status.find((i: any) => i.value == e);
			              	this.change(value,'status');
			              } }
			              selectedValue={ this.state.form.status.value }>
			              { this.state.status.map((i: any) => (
			                <Picker.Item
			                  key={ i.value.toString() }
			                  value={ i.value }
			                  label={ i.label }
			                />
			              )) }
			            </Picker>
		        	</View>
		        	<View style={ { flex: .5, alignItems: 'center' } }>
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
		        </View>

	        	<View style={ { alignItems: 'center' } }>
					<TouchableOpacity onPress={ () => this.props.navigation.navigate('CreateEditModerator',{
						countries: this.state.countriesRaw,
						permissions: this.state.permissions
					}) }>
						<View style={ { ...styles.searchButton, width: 200, backgroundColor: Colors.yellow } }>
							<Text style={ styles.searchText }>Nuevo Moderador</Text>
						</View>
					</TouchableOpacity>
		        </View>

				<FlatList
				  contentContainerStyle={ styles.padding }
		          data={ this.state.data }
		          keyExtractor={ (item: any) => item.id.toString() }
		          ListFooterComponent={ this.renderFooter }
		          ListEmptyComponent={
	        	  	<Text style={ { textAlign: 'center', fontSize: 16 } }>No hay moderadores registrados</Text>
	        	  }
		          renderItem={ ({ item: i, index }) => {
		          	const action: string = i.status == 0 ? 'Activar' : 'Desactivar';
					
					return (
						<TouchableWithoutFeedback onPress={ () => null }>
							<View style={ styles.item }>
			          			<View style={ { flex: .3, alignItems: 'center', justifyContent: 'center' } }>
			          				<Image style={ styles.icon } source={ Icons.menu.AdminModerators } />
			          			</View>
			          			<View style={ { flex: .6 } }>
			          				<Text numberOfLines={ 1 }>{ i.person.name + ' ' + i.person.lastname }</Text>
			          				<Label numberOfLines={ 1 } label="Correo">{ i.email }</Label>
			          				<Label label="Teléfono">{ i.person.phone }</Label>
			          				<Label label="País">{ i.person.country.name }</Label>
			          				<Label label="Estatus">{ i.status == 1 ? 'Activo' : 'Inactivo' }</Label>
								</View>
								<View style={ { flex: .1, alignItems: 'flex-end' } }>
									<OptionsMenu
					                  options={ [
					                    {
					                      label: 'Editar',
					                      action: () => this.props.navigation.navigate('CreateEditModerator',{
					                      	moderator: i,
					                      	countries: this.state.countriesRaw,
											permissions: this.state.permissions
					                      })
					                    },
					                    {
					                      label: 'Cambiar Contraseña',
					                      action: () => this.props.navigation.navigate('ChangePassword',{
					                      	moderator: i
					                      })
					                    },
					                    {
					                      label: i.status == 1 ? 'Desactivar' : 'Activar',
					                      action: () => this.changeStatus(i,action,index)
					                    },
					                    {
					                      label: 'Eliminar',
					                      action: () => this.delete(i,index)
					                    },
					                  ] }>
					                  <View style={ { alignItems: 'center', flexDirection: 'row' } }>
					                    <Image
					                      source={ Icons.options }
					                      style={ {
					                        width: 16,
					                        height: 16,
					                        marginVertical: 12,
					                        marginStart: 12,
					                        marginEnd: 6,
					                      } }
					                    />
					                  </View>
					                </OptionsMenu>
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
	item: {
		backgroundColor: Colors.gray,
		borderRadius: 5,
		marginVertical: 5,
		padding: 10,
		flexDirection: 'row',
		...Styles.shadow
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
	icon: {
		resizeMode: 'contain',
		width: 40,
		height: 40
	},
	padding: {
		padding: 20
	}
});

export default Moderators;