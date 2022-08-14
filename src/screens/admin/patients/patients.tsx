import React from 'react';
import { Header } from 'widgets';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Icons } from 'assets';
import LoadingContainer from 'widgets/loading-container';
import { SafeAreaView, View, StyleSheet, FlatList, ActivityIndicator, PermissionsAndroid, Platform, Text, Image, TouchableOpacity, Alert, TouchableWithoutFeedback, Linking } from 'react-native';
import Colors from 'utils/colors';
import Button from 'widgets/button';
import { Picker, TextInput, OptionsMenu, Label } from 'widgets';
import { CountryService, PatientService, DocumentTypeService } from 'services/admin';
import { Styles, showAlert, DownloadFile } from 'utils';
import { socket } from 'services/socket';
import Toast from 'react-native-root-toast';
import FileViewer from 'react-native-file-viewer';
import { on } from 'jetemit';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class Patients extends React.Component<Props> {

	state = {
		data: [],
		page: 1,
		last_page: 1,
		loading: true,
		isLoadingMore: false,
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
		document_types: [],
		countries: [],
		countriesRaw: [],
		subscriber: () => null
	}

	onUserDeleted = (userId: number): void => {
		this.setState((prevState: any) => ({
			data: prevState.data.filter(({id}) => id !== userId)
		}));
	};

	async componentDidMount() {
		socket.on('patients/user-delete', this.onUserDeleted);

		await this.getCountries();
		this.load();

		this.setState({
			subscriber: on('patients/edit',(_data: any) => {
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
		socket.removeListener('patients/user-delete', this.onUserDeleted);

		this.state.subscriber();
	}

	getCountries = async () => {
		const res: any = await Promise.all([
			CountryService.get(),
			DocumentTypeService.get()
		])
		this.setState({
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
			countriesRaw: res[0].countries,
			document_types: res[1].types
		});
	}

	load = async () => {
		const params = {
			page: this.state.page,
			search: this.state.form.search,
			country: this.state.form.country.value,
			status: this.state.form.status.value
		}
		const res: any = await PatientService.get(params)
		this.setState({
			data: [...this.state.data,...res.patients.data],
			last_page: res.patients.last_page,
			loading: false,
			isLoadingMore: false
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

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	changeStatus = (item: any,action: string,index: number) => {
		Alert.alert(
		  "Confirmar",
		  `¿Desea ${ action.toLowerCase() } al paciente?`,
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await PatientService.changeStatus({
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
		  '¿Desea eliminar el paciente?',
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await PatientService.delete({
					id: item.id
				});
				let data: any = [...this.state.data];
				data.splice(index,1);
				this.setState({
					data
				});
				Toast.show("Se ha eliminado el paciente");
				socket.emit('patients/user-delete',item.id);
		    }},
		    {
		      text: 'Cancelar'
		    }
		  ],
		  { cancelable: false },
		);
	}

	verified = (item: any, index: number) => {
		Alert.alert(
		  "Confirmar",
		  '¿Desea verificar el paciente?',
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await PatientService.verified({
					id: item.id
				});
				let data: any = [...this.state.data];
				data[index].verified = 1;
				this.setState({
					data
				});
				Toast.show("Se ha verificado el paciente");
		    }},
		    {
		      text: 'Cancelar'
		    }
		  ],
		  { cancelable: false },
		);
	}

	print = async (patient: any) => {
		if (Platform.OS == 'android') {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
		    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
		    	this.continuePrint(patient);
		    }
		}
		else {
			this.continuePrint(patient);
		}		
	}

	continuePrint = async (patient: any) => {
		const res: any = await PatientService.print({
			user_id: patient.id
		});
		const path = await DownloadFile.download(res.url);
		if (Platform.OS == 'ios') {
		    Linking.openURL(path.path()).catch((err) => {
		      console.log(err)
		    });
		}
		else {
			FileViewer.open(path.path(),{
				showOpenWithDialog: true
			}).catch((err: any) => console.log(err))
			  .finally(async () => {
				await PatientService.deletePrint({
					name: res.name
				});
			  });
		}		
	}

	render() {
		const { navigation } = this.props;

		return (
	      <SafeAreaView style={ { flex: 1 } }>
	      	<Header
	      	  backIcon={ Icons.home }
	          title="Pacientes"
	          icon={ Icons.menu.AdminPatients }
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
					<TouchableOpacity onPress={ () => this.props.navigation.navigate('CreateEditPatient',{
						countries: this.state.countriesRaw,
						document_types: this.state.document_types
					}) }>
						<View style={ { ...styles.searchButton, width: 200, backgroundColor: Colors.yellow } }>
							<Text style={ styles.searchText }>Nuevo Paciente</Text>
						</View>
					</TouchableOpacity>
		        </View>

				<FlatList
				  contentContainerStyle={ styles.padding }
		          data={ this.state.data }
		          keyExtractor={ (item: any) => item.id.toString() }
		          ListFooterComponent={ this.renderFooter }
		          ListEmptyComponent={
	        	  	<Text style={ { textAlign: 'center', fontSize: 16 } }>No hay pacientes registrados</Text>
	        	  }
		          renderItem={ ({ item: i, index }) => {
		          	const action: string = i.status == 0 ? 'Activar' : 'Desactivar';
					let options_verified = [];
					if (i.verified == 0) {
						options_verified.push({
							label: 'Verificar',
					        action: () => this.verified(i,index)
						})
					}
					
					return (
						<TouchableWithoutFeedback onPress={ () => null }>
							<View style={ styles.item }>
			          			<View style={ { flex: .3, alignItems: 'center', justifyContent: 'center' } }>
			          				<Image style={ styles.icon } source={ Icons.menu.AdminPatients } />
			          			</View>
			          			<View style={ { flex: .6 } }>
			          				<Text numberOfLines={ 1 }>{ i.person.name + ' ' + i.person.lastname }</Text>
			          				<Label label="ID">{ i.id }</Label>
			          				<Label numberOfLines={ 1 } label="Correo">{ i.email }</Label>
			          				<Label label="Teléfono">{ i.person.phone }</Label>
			          				<Label label="País">{ i.person.country.name }</Label>
			          				<Label label="Estatus">{ i.status == 1 ? 'Activo' : 'Inactivo' }</Label>
			          				{ i.verified == 0 && <Text style={ { fontWeight: 'bold' } }>Por verificar</Text> }
								</View>
								<View style={ { flex: .1, alignItems: 'flex-end' } }>
									<OptionsMenu
									  // @ts-ignore
					                  options={ [
					                  	{
					                      label: "Historial Médico",
					                      action: () => {
					                        this.props.navigation.navigate('PatientRecord', {
												userId: i.id,
											})
					                      }
										},
										{
										  label: 'Ver',
										  action: () => 
										  	this.props.navigation.navigate('ViewPatient',{
												patient: i,
												countries: this.state.countriesRaw,
												document_types: this.state.document_types
										    })
										  },
					                    {
					                      label: 'Editar',
					                      action: () => this.props.navigation.navigate('CreateEditPatient',{
					                      	patient: i,
					                      	countries: this.state.countriesRaw,
					                      	document_types: this.state.document_types
					                      })
					                    },
					                    {
					                      label: 'Cambiar Contraseña',
					                      action: () => this.props.navigation.navigate('ChangePassword',{
					                      	patient: i
					                      })
					                    },
					                    {
					                      label: 'Veracidad de la Información',
					                      action: () => this.print(i)
					                    },
					                    ...options_verified,
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

export default Patients;